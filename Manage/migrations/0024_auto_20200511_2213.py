# Generated by Django 2.1.15 on 2020-05-11 22:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Manage', '0023_auto_20200508_1649'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sms_history',
            name='status',
            field=models.CharField(default='2', max_length=8),
        ),
    ]
