from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0008_resequence_history_booking_ids'),
    ]

    operations = [
        migrations.CreateModel(
            name='RoomReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField()),
                ('comment', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='review', to='api.booking')),
                ('guest', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='room_reviews', to=settings.AUTH_USER_MODEL)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='room_reviews', to='api.room')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
