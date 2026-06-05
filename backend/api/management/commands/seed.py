"""
Usage:
    cd backend && python manage.py seed
    python manage.py seed --clear   # wipe and re-seed
"""
from datetime import date
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from api.models import User, RoomType, Room, Booking, AuditLog


ROOM_TYPES = [
    {'name': 'Standard', 'base_price': 2400, 'capacity': 2, 'count': 14,
     'gradient_css': 'linear-gradient(135deg,#93c5fd,#6366f1)'},
    {'name': 'Deluxe', 'base_price': 3600, 'capacity': 2, 'count': 10,
     'gradient_css': 'linear-gradient(135deg,#fbbf24,#f97316)'},
    {'name': 'Suite', 'base_price': 5800, 'capacity': 4, 'count': 5,
     'gradient_css': 'linear-gradient(135deg,#5eead4,#0ea5e9)'},
    {'name': 'Family', 'base_price': 4400, 'capacity': 5, 'count': 7,
     'gradient_css': 'linear-gradient(135deg,#f0abfc,#a855f7)'},
]

ROOMS = [
    {'room_id': 'R-201', 'name': 'Garden Standard', 'type': 'Standard', 'capacity': 2,
     'price': 2400, 'status': 'Active', 'floor': 2,
     'amenities': ['wifi', 'ac', 'tv', 'coffee'],
     'gradient_css': 'linear-gradient(135deg,#a5b4fc,#6366f1)',
     'rating': 4.6, 'reviews': 128,
     'description': 'A bright, restful room overlooking the inner garden — perfect for solo travellers and couples.'},
    {'room_id': 'R-305', 'name': 'Deluxe King', 'type': 'Deluxe', 'capacity': 2,
     'price': 3600, 'status': 'Active', 'floor': 3,
     'amenities': ['wifi', 'ac', 'tv', 'coffee', 'bath'],
     'gradient_css': 'linear-gradient(135deg,#fcd34d,#f97316)',
     'rating': 4.8, 'reviews': 96,
     'description': 'Spacious king room with a lounge nook, premium linens and a rainfall shower.'},
    {'room_id': 'R-410', 'name': 'Panorama Suite', 'type': 'Suite', 'capacity': 4,
     'price': 5800, 'status': 'Active', 'floor': 4,
     'amenities': ['wifi', 'ac', 'tv', 'coffee', 'bath', 'parking'],
     'gradient_css': 'linear-gradient(135deg,#5eead4,#0284c7)',
     'rating': 4.9, 'reviews': 64,
     'description': 'Top-floor suite with a separate living area and sweeping views of the bay.'},
    {'room_id': 'R-112', 'name': 'Family Garden', 'type': 'Family', 'capacity': 5,
     'price': 4400, 'status': 'Active', 'floor': 1,
     'amenities': ['wifi', 'ac', 'tv', 'coffee', 'parking'],
     'gradient_css': 'linear-gradient(135deg,#f0abfc,#a855f7)',
     'rating': 4.7, 'reviews': 81,
     'description': 'Two interconnected rooms with bunk beds — built for families and small groups.'},
    {'room_id': 'R-208', 'name': 'Garden Standard II', 'type': 'Standard', 'capacity': 2,
     'price': 2400, 'status': 'Active', 'floor': 2,
     'amenities': ['wifi', 'ac', 'tv'],
     'gradient_css': 'linear-gradient(135deg,#bae6fd,#3b82f6)',
     'rating': 4.5, 'reviews': 142,
     'description': 'Cozy standard with garden access and a quiet reading corner.'},
    {'room_id': 'R-307', 'name': 'Deluxe Twin', 'type': 'Deluxe', 'capacity': 3,
     'price': 3800, 'status': 'Inactive', 'floor': 3,
     'amenities': ['wifi', 'ac', 'tv', 'coffee'],
     'gradient_css': 'linear-gradient(135deg,#fda4af,#f43f5e)',
     'rating': 4.6, 'reviews': 73,
     'description': 'Twin-bed deluxe undergoing a refresh — temporarily off the booking grid.'},
]

USERS = [
    # username / first / last / email / phone / role / password
    ('owner', 'Rosa', 'Dela Cruz', 'owner@inn.com', '', 'owner', 'Owner@123'),
    ('admin', 'Rosa', 'M.', 'admin@inn.com', '', 'admin', 'Admin@123'),
    ('maria', 'Maria', 'Santos', 'maria.santos@gmail.com', '+63 917 555 0142', 'customer', 'Customer@123'),
    ('david', 'David', 'Cruz', 'd.cruz@outlook.com', '+63 918 555 0099', 'customer', 'Customer@123'),
    ('aiko', 'Aiko', 'Tanaka', 'aiko.t@gmail.com', '+81 90 5555 2210', 'customer', 'Customer@123'),
    ('james', 'James', 'Whitfield', 'jwhitfield@proton.me', '+44 7700 900321', 'customer', 'Customer@123'),
    ('priya', 'Priya', 'Nair', 'priya.nair@gmail.com', '+91 98765 43210', 'customer', 'Customer@123'),
    ('liam', 'Liam', "O'Brien", 'liam.obrien@gmail.com', '+353 85 555 0177', 'customer', 'Customer@123'),
    ('chen', 'Chen', 'Wei', 'chen.wei@163.com', '+86 138 5555 6677', 'customer', 'Customer@123'),
    ('sofia', 'Sofia', 'Reyes', 'sofia.reyes@gmail.com', '+63 919 555 0233', 'customer', 'Customer@123'),
]

BOOKINGS = [
    # booking_id / guest_user / room_id / check_in / check_out / nights / guests / amount / status
    ('BK-3391', 'maria', 'R-410', date(2026, 6, 14), date(2026, 6, 18), 4, 2, 23200, 'Confirmed'),
    ('BK-3390', 'sofia', 'R-305', date(2026, 6, 12), date(2026, 6, 14), 2, 2, 7200, 'Pending'),
    ('BK-3388', 'david', 'R-201', date(2026, 6, 10), date(2026, 6, 13), 3, 1, 7200, 'Confirmed'),
    ('BK-3385', 'aiko', 'R-112', date(2026, 6, 20), date(2026, 6, 25), 5, 4, 22000, 'Pending'),
    ('BK-3380', 'priya', 'R-305', date(2026, 5, 28), date(2026, 5, 30), 2, 2, 7200, 'Completed'),
    ('BK-3377', 'liam', 'R-201', date(2026, 5, 25), date(2026, 5, 27), 2, 2, 4800, 'Cancelled'),
    ('BK-3375', 'chen', 'R-410', date(2026, 5, 22), date(2026, 5, 26), 4, 3, 23200, 'Completed'),
    ('BK-3372', 'maria', 'R-305', date(2026, 5, 18), date(2026, 5, 20), 2, 2, 7200, 'Completed'),
]

AUDIT = [
    ('Admin · Rosa M.', 'Confirmed booking', 'BK-3388', 'Confirmed'),
    ('System', 'Forecast model retrained', '2,348 records', 'info'),
    ('Admin · Rosa M.', 'Deactivated room', 'R-307 · Deluxe Twin', 'Inactive'),
    ("Customer · Liam O'Brien", 'Cancelled booking', 'BK-3377', 'Cancelled'),
    ('Admin · Rosa M.', 'Reset password', 'C-1063 · James W.', 'info'),
    ('Customer · Sofia Reyes', 'Created booking', 'BK-3390', 'Pending'),
]


class Command(BaseCommand):
    help = 'Seed the database with prototype data'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data before seeding')

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            AuditLog.objects.all().delete()
            Booking.objects.all().delete()
            Room.objects.all().delete()
            RoomType.objects.all().delete()
            User.objects.all().delete()

        self.stdout.write('Seeding room types...')
        rt_map = {}
        for rt in ROOM_TYPES:
            obj, _ = RoomType.objects.get_or_create(
                name=rt['name'],
                defaults={k: v for k, v in rt.items() if k != 'name'},
            )
            rt_map[rt['name']] = obj

        self.stdout.write('Seeding rooms...')
        room_map = {}
        for r in ROOMS:
            rt = rt_map[r.pop('type')]
            obj, _ = Room.objects.get_or_create(
                room_id=r['room_id'],
                defaults={**r, 'room_type': rt},
            )
            room_map[obj.room_id] = obj
            r['type'] = rt.name  # restore for idempotency

        self.stdout.write('Seeding users...')
        user_map = {}
        for username, first, last, email, phone, role, pwd in USERS:
            obj, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first, 'last_name': last, 'email': email,
                    'phone': phone, 'role': role,
                    'is_staff': role in ('owner', 'admin'),
                    'is_superuser': role == 'owner',
                },
            )
            if created:
                obj.set_password(pwd)
                obj.save()
            user_map[username] = obj

        self.stdout.write('Seeding bookings...')
        for bk_id, uname, room_id, ci, co, nights, guests, amt, st in BOOKINGS:
            Booking.objects.get_or_create(
                booking_id=bk_id,
                defaults={
                    'guest': user_map[uname],
                    'room': room_map[room_id],
                    'check_in': ci, 'check_out': co,
                    'nights': nights, 'guests_count': guests,
                    'amount': amt, 'status': st,
                },
            )

        self.stdout.write('Seeding audit log...')
        if not AuditLog.objects.exists():
            for who, action, target, kind in AUDIT:
                AuditLog.objects.create(who=who, action=action, target=target, kind=kind)

        self.stdout.write(self.style.SUCCESS('Database seeded successfully.'))
        self.stdout.write('  Accounts:')
        self.stdout.write('    owner@inn.com  / Owner@123  (Owner)')
        self.stdout.write('    admin@inn.com  / Admin@123  (Admin)')
        self.stdout.write('    maria.santos@gmail.com / Customer@123  (Customer)')
