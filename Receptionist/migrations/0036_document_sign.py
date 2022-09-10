# Generated by Django 2.1.15 on 2020-05-26 16:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0035_sign_manage'),
    ]

    operations = [
        migrations.CreateModel(
            name='document_sign',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('depart', models.CharField(default='', max_length=16)),
                ('patient_id', models.CharField(default='', max_length=16)),
                ('patient_name', models.CharField(default='', max_length=16)),
                ('type', models.CharField(default='', max_length=16)),
                ('document', models.CharField(default='', max_length=64)),
                ('is_sign', models.CharField(default='N', max_length=2)),
                ('sign_data', models.TextField(default='')),
                ('use_yn', models.CharField(default='Y', max_length=2)),
                ('registrant', models.CharField(default='', max_length=4)),
                ('date_register', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('modifier', models.CharField(default='', max_length=4)),
                ('date_modify', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('diagnosis', models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='Receptionist.Diagnosis')),
            ],
        ),
    ]
