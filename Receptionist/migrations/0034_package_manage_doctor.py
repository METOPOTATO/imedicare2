# Generated by Django 2.1.15 on 2020-05-19 22:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0033_auto_20200519_1948'),
    ]

    operations = [
        migrations.AddField(
            model_name='package_manage',
            name='doctor',
            field=models.CharField(default='', max_length=4),
        ),
    ]
