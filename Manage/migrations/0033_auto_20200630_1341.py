# Generated by Django 2.1.15 on 2020-06-30 13:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Manage', '0032_auto_20200629_1429'),
    ]

    operations = [
        migrations.AddField(
            model_name='board_comment',
            name='end_date',
            field=models.CharField(default='0000-00-00 00:00:00', max_length=20),
        ),
        migrations.AddField(
            model_name='board_comment',
            name='expected_date',
            field=models.CharField(default='0000-00-00 00:00:00', max_length=20),
        ),
        migrations.AddField(
            model_name='board_comment',
            name='in_charge',
            field=models.CharField(default='', max_length=8),
        ),
        migrations.AddField(
            model_name='board_comment',
            name='progress',
            field=models.CharField(default='', max_length=16),
        ),
        migrations.AddField(
            model_name='board_comment',
            name='start_date',
            field=models.CharField(default='0000-00-00 00:00:00', max_length=20),
        ),
    ]
