# Generated by Django 2.1.15 on 2022-05-25 21:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0045_reservation_re_reservation_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='reception',
            name='profile_status',
            field=models.CharField(choices=[('waiting', 'waiting'), ('deleted', 'deleted'), ('invoice', 'invoice'), ('insurance', 'insurance'), ('done', 'done')], default='waiting', max_length=16),
        ),
        migrations.AddField(
            model_name='reservation',
            name='apointment_memo',
            field=models.CharField(default='', max_length=2048, null=True),
        ),
        migrations.AddField(
            model_name='reservation',
            name='drop_off_addr',
            field=models.CharField(default='', max_length=2048, null=True),
        ),
        migrations.AddField(
            model_name='reservation',
            name='drop_off_status',
            field=models.CharField(default='Not start', max_length=16),
        ),
        migrations.AddField(
            model_name='reservation',
            name='drop_off_time',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='reservation',
            name='drop_off_vehicle',
            field=models.CharField(choices=[('Xe số 1', 'Xe số 1'), ('Xe số 2', 'Xe số 2'), ('Xe số 3', 'Xe số 3'), ('Xe số 4', 'Xe số 4'), ('Xe số 5', 'Xe số 5')], default='', max_length=16),
        ),
        migrations.AddField(
            model_name='reservation',
            name='follower',
            field=models.CharField(default='0', max_length=16),
        ),
        migrations.AddField(
            model_name='reservation',
            name='funnel',
            field=models.CharField(default='', max_length=2),
        ),
        migrations.AddField(
            model_name='reservation',
            name='funnel_etc',
            field=models.CharField(default='', max_length=64),
        ),
        migrations.AddField(
            model_name='reservation',
            name='need_pick_up',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='reservation',
            name='passport',
            field=models.CharField(max_length=16, null=True),
        ),
        migrations.AddField(
            model_name='reservation',
            name='pick_up_addr',
            field=models.CharField(default='', max_length=2048, null=True),
        ),
        migrations.AddField(
            model_name='reservation',
            name='pick_up_status',
            field=models.CharField(default='Not start', max_length=16),
        ),
        migrations.AddField(
            model_name='reservation',
            name='pick_up_time',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='reservation',
            name='pick_up_vehicle',
            field=models.CharField(choices=[('Xe số 1', 'Xe số 1'), ('Xe số 2', 'Xe số 2'), ('Xe số 3', 'Xe số 3'), ('Xe số 4', 'Xe số 4'), ('Xe số 5', 'Xe số 5')], default='', max_length=16),
        ),
    ]
