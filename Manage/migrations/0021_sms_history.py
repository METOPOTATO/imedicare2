# Generated by Django 2.1.15 on 2020-05-08 10:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Manage', '0020_auto_20200507_2039'),
    ]

    operations = [
        migrations.CreateModel(
            name='sms_history',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(default='', max_length=12)),
                ('company_name', models.CharField(default='', max_length=32)),
                ('sender', models.CharField(default='', max_length=32)),
                ('phone', models.CharField(default='', max_length=16)),
                ('contents', models.CharField(default='', max_length=80)),
                ('status', models.CharField(default='2', max_length=1)),
                ('res_code', models.CharField(default='', max_length=16)),
                ('date_of_registered', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('date_of_recieved', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
            ],
        ),
    ]
