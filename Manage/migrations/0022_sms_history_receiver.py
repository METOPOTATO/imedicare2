# Generated by Django 2.1.15 on 2020-05-08 10:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Manage', '0021_sms_history'),
    ]

    operations = [
        migrations.AddField(
            model_name='sms_history',
            name='receiver',
            field=models.CharField(default='', max_length=32),
        ),
    ]
