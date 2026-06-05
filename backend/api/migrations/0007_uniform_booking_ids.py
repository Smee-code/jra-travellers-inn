import re
from django.db import migrations


BOOKING_ID_RE = re.compile(r'^BK-(\d+)$')


def forwards(apps, schema_editor):
    Booking = apps.get_model('api', 'Booking')
    AuditLog = apps.get_model('api', 'AuditLog')

    max_num = 3000
    for booking_id in Booking.objects.values_list('booking_id', flat=True):
        match = BOOKING_ID_RE.fullmatch(booking_id or '')
        if match:
            max_num = max(max_num, int(match.group(1)))

    for booking in Booking.objects.order_by('created_at', 'id'):
        if BOOKING_ID_RE.fullmatch(booking.booking_id or ''):
            continue
        old_id = booking.booking_id
        max_num += 1
        booking.booking_id = f'BK-{max_num}'
        booking.save(update_fields=['booking_id'])
        AuditLog.objects.filter(target=old_id).update(target=booking.booking_id)


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_systemconfig'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
