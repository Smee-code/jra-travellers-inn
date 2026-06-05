from django.db import migrations


def forwards(apps, schema_editor):
    Booking = apps.get_model('api', 'Booking')
    AuditLog = apps.get_model('api', 'AuditLog')

    history = list(Booking.objects.filter(booking_id__gt='BK-4420').order_by('created_at', 'id'))

    original_ids = {booking.pk: booking.booking_id for booking in history}

    for index, booking in enumerate(history, start=1):
        booking.booking_id = f'TMP-BK-{index}'
        booking.save(update_fields=['booking_id'])

    start = max(3000, 4416 - len(history))
    for index, booking in enumerate(history, start=1):
        old_id = original_ids[booking.pk]
        booking.booking_id = f'BK-{start + index - 1}'
        booking.save(update_fields=['booking_id'])
        AuditLog.objects.filter(target=old_id).update(target=booking.booking_id)


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_uniform_booking_ids'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
