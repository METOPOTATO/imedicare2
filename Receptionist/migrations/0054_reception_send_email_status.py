# Generated by Django 2.1.15 on 2024-03-23 22:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0053_draftpatient'),
    ]

    operations = [
        migrations.AddField(
            model_name='reception',
            name='send_email_status',
            field=models.IntegerField(default=0, null=True),
        ),
    ]
