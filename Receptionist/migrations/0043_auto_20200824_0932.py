# Generated by Django 2.1.15 on 2020-08-24 09:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0042_reservation_division'),
    ]

    operations = [
        migrations.AddField(
            model_name='reception',
            name='done_treatement_date',
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
        migrations.AddField(
            model_name='reception',
            name='start_treatement_date',
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='payment',
            name='progress',
            field=models.CharField(choices=[('paid', 'paid'), ('unpaid', 'unpaid')], default='unpaid', max_length=6),
        ),
    ]
