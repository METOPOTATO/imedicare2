# Generated by Django 2.1.15 on 2024-09-29 23:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0062_auto_20240928_2319'),
    ]

    operations = [
        migrations.AddField(
            model_name='draftpatient',
            name='depart',
            field=models.CharField(default='', max_length=255),
        ),
    ]
