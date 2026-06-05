from django.contrib.auth.models import AbstractUser
from django.db import models
import re


BOOKING_ID_RE = re.compile(r'^BK-(\d+)$')


def next_booking_id():
    max_num = 3000
    for booking_id in Booking.objects.values_list('booking_id', flat=True):
        match = BOOKING_ID_RE.fullmatch(booking_id or '')
        if match:
            max_num = max(max_num, int(match.group(1)))
    return f'BK-{max_num + 1}'


def is_uniform_booking_id(value):
    return bool(BOOKING_ID_RE.fullmatch(value or ''))


class User(AbstractUser):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('customer', 'Customer'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=160, blank=True)
    # first_name + last_name inherited from AbstractUser
    # email inherited — used as display identifier

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'

    @property
    def full_name(self):
        return self.get_full_name() or self.username


class RoomType(models.Model):
    name = models.CharField(max_length=50)
    base_price = models.IntegerField()
    capacity = models.IntegerField()
    count = models.IntegerField(default=0)
    gradient_css = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.name


class Room(models.Model):
    STATUS_CHOICES = [('Active', 'Active'), ('Inactive', 'Inactive')]
    AMENITY_CHOICES = ['wifi', 'ac', 'tv', 'coffee', 'bath', 'parking']

    room_id = models.CharField(max_length=20, unique=True)   # e.g. R-201
    name = models.CharField(max_length=100)
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name='rooms')
    capacity = models.IntegerField()
    price = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    floor = models.IntegerField()
    amenities = models.JSONField(default=list)
    rating = models.FloatField(default=4.5)
    reviews = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    gradient_css = models.CharField(max_length=200, blank=True)
    image_url = models.TextField(blank=True)

    def __str__(self):
        return f'{self.room_id} — {self.name}'


class Booking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]
    booking_id = models.CharField(max_length=20, unique=True)   # e.g. BK-3391
    guest = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    check_in = models.DateField()
    check_out = models.DateField()
    nights = models.IntegerField()
    guests_count = models.IntegerField(default=1)
    amount = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.booking_id} — {self.guest.full_name} → {self.room.room_id}'


class RoomReview(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_reviews')
    guest = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.room.room_id} review by {self.guest.full_name}'


class AuditLog(models.Model):
    who = models.CharField(max_length=100)
    action = models.CharField(max_length=200)
    target = models.CharField(max_length=100)
    kind = models.CharField(max_length=50, default='info')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'[{self.kind}] {self.who}: {self.action} — {self.target}'


class ReportRecord(models.Model):
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
    ]

    name = models.CharField(max_length=160)
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES)
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    size_label = models.CharField(max_length=30, blank=True)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reports')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.format})'


class PushSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_subscriptions')
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.full_name} push subscription'


class SystemConfig(models.Model):
    logo_data_url = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return 'System configuration'
