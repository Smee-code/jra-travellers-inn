from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_reportrecord'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='location',
            field=models.CharField(blank=True, max_length=160),
        ),
    ]
