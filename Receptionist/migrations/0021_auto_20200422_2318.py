# Generated by Django 2.1.15 on 2020-04-22 23:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0020_auto_20200406_1606'),
    ]

    operations = [
        migrations.AddField(
            model_name='reception',
            name='need_insurance',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='reception',
            name='need_invoice',
            field=models.BooleanField(default=False),
        ),
    ]
