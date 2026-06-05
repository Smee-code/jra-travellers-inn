from django.contrib.auth.password_validation import validate_password
from datetime import date
from django.db.models import Avg
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, RoomType, Room, Booking, RoomReview, AuditLog, ReportRecord, PushSubscription, next_booking_id


# ── Auth ──────────────────────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['name'] = user.full_name
        token['email'] = user.email
        token['phone'] = user.phone
        token['location'] = user.location
        return token

    def validate(self, attrs):
        login_id = attrs.get(self.username_field, '').strip()
        if '@' in login_id:
            user = User.objects.filter(email__iexact=login_id, is_active=True).first()
            if user:
                attrs[self.username_field] = user.username
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['name'] = self.user.full_name
        data['email'] = self.user.email
        data['phone'] = self.user.phone
        data['location'] = self.user.location
        data['username'] = self.user.username
        data['id'] = self.user.id
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(role='customer', **validated_data)
        user.set_password(password)
        user.save()
        return user


# ── Users ─────────────────────────────────────────────────────────────────────

class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()
    joined = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'phone', 'location', 'role',
                  'is_active', 'joined', 'bookings_count']

    def get_full_name(self, obj):
        return obj.full_name

    def get_bookings_count(self, obj):
        return obj.bookings.count()

    def get_joined(self, obj):
        return obj.date_joined.strftime('%b %Y')


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'location',
                  'role', 'is_active']
        read_only_fields = ['role']


class ManagedUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email',
                  'phone', 'location', 'role', 'password', 'is_active', 'date_joined']
        read_only_fields = ['id', 'full_name', 'is_active', 'date_joined']

    def validate_role(self, value):
        if value not in ('customer', 'owner'):
            raise serializers.ValidationError('Role must be customer or owner.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', 'customer')
        user = User(**validated_data)
        user.is_active = True
        user.is_staff = role == 'owner'
        user.is_superuser = role == 'owner'
        user.set_password(password)
        user.save()
        return user


# ── Room Type ─────────────────────────────────────────────────────────────────

class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'


# ── Room ──────────────────────────────────────────────────────────────────────

class RoomReviewSerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(source='guest.full_name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    created = serializers.SerializerMethodField()

    class Meta:
        model = RoomReview
        fields = ['id', 'booking', 'room', 'room_name', 'guest_name', 'rating', 'comment', 'created_at', 'created']
        read_only_fields = ['id', 'booking', 'room', 'room_name', 'guest_name', 'created_at', 'created']

    def get_created(self, obj):
        if not obj.created_at:
            return ''
        d = obj.created_at
        return f'{d.strftime("%b")} {d.day}'


class RoomSerializer(serializers.ModelSerializer):
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)
    available = serializers.SerializerMethodField()
    availability_label = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    recent_reviews = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'room_id', 'name', 'room_type', 'room_type_name', 'capacity',
                  'price', 'status', 'floor', 'amenities', 'rating', 'reviews',
                  'description', 'gradient_css', 'image_url', 'available', 'availability_label', 'recent_reviews']

    def _query_dates(self):
        request = self.context.get('request')
        if not request:
            return None, None
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')
        try:
            return date.fromisoformat(check_in), date.fromisoformat(check_out)
        except (TypeError, ValueError):
            return None, None

    def get_available(self, obj):
        if obj.status != 'Active':
            return False
        check_in, check_out = self._query_dates()
        if not check_in or not check_out or check_out <= check_in:
            return True
        return not Booking.objects.filter(
            room=obj,
            status__in=['Pending', 'Confirmed'],
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).exists()

    def get_availability_label(self, obj):
        if obj.status != 'Active':
            return 'Unavailable'
        return 'Available' if self.get_available(obj) else 'Unavailable'

    def get_rating(self, obj):
        avg = obj.room_reviews.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg else 0

    def get_reviews(self, obj):
        return obj.room_reviews.count()

    def get_recent_reviews(self, obj):
        reviews = obj.room_reviews.select_related('guest').all()[:5]
        return RoomReviewSerializer(reviews, many=True).data


# ── Booking ───────────────────────────────────────────────────────────────────

class BookingSerializer(serializers.ModelSerializer):
    guest_name     = serializers.CharField(source='guest.full_name', read_only=True)
    guest_email    = serializers.EmailField(source='guest.email', read_only=True)
    guest_phone    = serializers.CharField(source='guest.phone', read_only=True)
    room_name      = serializers.CharField(source='room.name', read_only=True)
    room_type_name = serializers.CharField(source='room.room_type.name', read_only=True)
    room_grad      = serializers.CharField(source='room.gradient_css', read_only=True)
    room_image     = serializers.CharField(source='room.image_url', read_only=True)
    room_price     = serializers.IntegerField(source='room.price', read_only=True)
    room_capacity  = serializers.IntegerField(source='room.capacity', read_only=True)
    created        = serializers.SerializerMethodField()
    can_review     = serializers.SerializerMethodField()
    review         = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'guest', 'guest_name', 'guest_email', 'guest_phone', 'room', 'room_name',
                  'room_type_name', 'room_grad', 'room_image', 'room_price', 'room_capacity',
                  'check_in', 'check_out', 'nights', 'guests_count', 'amount',
                  'status', 'created_at', 'created', 'can_review', 'review']
        read_only_fields = ['booking_id', 'created_at']

    def get_created(self, obj):
        if not obj.created_at:
            return ''
        d = obj.created_at
        return f'{d.strftime("%b")} {d.day}'  # d.day strips the leading zero cross-platform

    def get_can_review(self, obj):
        return obj.status == 'Completed' and not hasattr(obj, 'review')

    def get_review(self, obj):
        review = getattr(obj, 'review', None)
        return RoomReviewSerializer(review).data if review else None

    def create(self, validated_data):
        validated_data['booking_id'] = next_booking_id()
        return super().create(validated_data)


class BookingCreateSerializer(serializers.ModelSerializer):
    SERVICE_FEE = 850

    class Meta:
        model = Booking
        fields = ['room', 'check_in', 'check_out', 'nights', 'guests_count', 'amount']

    def validate(self, attrs):
        request = self.context['request']
        today = timezone.localdate()
        room = attrs['room']
        check_in = attrs['check_in']
        check_out = attrs['check_out']
        guests_count = attrs.get('guests_count') or 1

        if room.status != 'Active':
            raise serializers.ValidationError({'detail': 'This room is not available for booking.'})
        if check_in < today:
            raise serializers.ValidationError({'detail': 'Check-in date cannot be in the past.'})
        if check_out <= check_in:
            raise serializers.ValidationError({'detail': 'Check-out date must be after check-in date.'})
        if guests_count < 1:
            raise serializers.ValidationError({'detail': 'Guests must be at least 1.'})
        if guests_count > room.capacity:
            raise serializers.ValidationError({'detail': f'This room can only accommodate up to {room.capacity} guests.'})

        nights = (check_out - check_in).days
        attrs['nights'] = nights
        attrs['amount'] = (room.price * nights) + self.SERVICE_FEE

        pending_exists = Booking.objects.filter(
            guest=request.user,
            room=room,
            status='Pending',
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).exists()
        if pending_exists:
            raise serializers.ValidationError({
                'detail': 'You already have a pending reservation for this room.'
            })
        overlap_exists = Booking.objects.filter(
            room=room,
            status__in=['Pending', 'Confirmed'],
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).exists()
        if overlap_exists:
            raise serializers.ValidationError({
                'detail': 'This room is unavailable for the selected dates.'
            })
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        validated_data['guest'] = request.user
        validated_data['booking_id'] = next_booking_id()
        return super().create(validated_data)


# ── Audit Log ─────────────────────────────────────────────────────────────────

class AuditLogSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'who', 'action', 'target', 'kind', 'timestamp', 'time']

    def get_time(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        now = timezone.now()
        diff = now - obj.timestamp
        if diff < timedelta(hours=1):
            mins = int(diff.seconds / 60)
            return f'{mins}m ago'
        if diff < timedelta(hours=24):
            hrs = int(diff.seconds / 3600)
            return f'{hrs}h ago'
        if diff < timedelta(days=2):
            return 'Yesterday'
        return f'{diff.days} days ago'


class ReportRecordSerializer(serializers.ModelSerializer):
    fmt = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    size = serializers.CharField(source='size_label')

    class Meta:
        model = ReportRecord
        fields = ['id', 'name', 'format', 'fmt', 'date', 'size', 'date_from', 'date_to', 'created_at']

    def get_fmt(self, obj):
        return obj.get_format_display()

    def get_date(self, obj):
        d = obj.created_at
        return f'{d.strftime("%b")} {d.day}, {d.year}'


class PushSubscriptionSerializer(serializers.ModelSerializer):
    keys = serializers.DictField(write_only=True)

    class Meta:
        model = PushSubscription
        fields = ['endpoint', 'keys']

    def validate_keys(self, value):
        if not value.get('p256dh') or not value.get('auth'):
            raise serializers.ValidationError('Subscription keys are incomplete.')
        return value

    def create(self, validated_data):
        keys = validated_data.pop('keys')
        user = self.context['request'].user
        sub, _ = PushSubscription.objects.update_or_create(
            endpoint=validated_data['endpoint'],
            defaults={
                'user': user,
                'p256dh': keys['p256dh'],
                'auth': keys['auth'],
            },
        )
        return sub
