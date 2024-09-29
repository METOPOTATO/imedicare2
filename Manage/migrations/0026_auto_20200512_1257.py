# Generated by Django 2.1.15 on 2020-05-12 12:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Manage', '0025_draft_is_kbl'),
    ]

    operations = [
        migrations.AddField(
            model_name='board_contents',
            name='is_KBL',
            field=models.CharField(default='N', max_length=2),
        ),
        migrations.AddField(
            model_name='board_file',
            name='is_KBL',
            field=models.CharField(default='N', max_length=2),
        ),
        migrations.AddField(
            model_name='sms_history',
            name='is_KBL',
            field=models.CharField(default='N', max_length=2),
        ),
    ]
