# Generated by Django 2.1.15 on 2020-05-19 15:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Doctor', '0038_precedure_count'),
        ('Patient', '0012_patient_marking'),
        ('Receptionist', '0024_diagnosis_posi_text'),
    ]

    operations = [
        migrations.CreateModel(
            name='Package_Manage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('depart', models.CharField(default='', max_length=4)),
                ('precedure_name', models.CharField(default='', max_length=64)),
                ('itme_round', models.CharField(default='0', max_length=4)),
                ('memo', models.CharField(default='0', max_length=256)),
                ('date_bought', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('date_used', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('date_refund', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('date_expired', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('use_yn', models.CharField(default='Y', max_length=2)),
                ('registrant', models.CharField(default='', max_length=4)),
                ('date_register', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('modifier', models.CharField(default='', max_length=4)),
                ('date_modify', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='Patient.Patient')),
                ('precedure', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='Doctor.Precedure')),
            ],
        ),
    ]
