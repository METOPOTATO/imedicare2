# Generated by Django 2.1.15 on 2020-06-11 13:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0039_paymentrecord_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymentrecord',
            name='memo',
            field=models.CharField(default='', max_length=256),
        ),
    ]
