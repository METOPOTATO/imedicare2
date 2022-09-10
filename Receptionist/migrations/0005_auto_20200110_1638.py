# Generated by Django 2.1.15 on 2020-01-10 16:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0004_reception_need_medical_report'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='additional',
            field=models.IntegerField(default=None, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='is_emergency',
            field=models.BooleanField(default=False),
        ),
    ]
