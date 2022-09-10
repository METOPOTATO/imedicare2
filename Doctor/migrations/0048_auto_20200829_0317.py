# Generated by Django 2.1.15 on 2020-08-29 03:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Doctor', '0047_vaccinehistory_reception'),
    ]

    operations = [
        migrations.AddField(
            model_name='medicine',
            name='vaccine_code',
            field=models.CharField(default='', max_length=64),
        ),
        migrations.AddField(
            model_name='medicine',
            name='vaccine_recommend_time',
            field=models.CharField(default='', max_length=64),
        ),
    ]
