# Generated by Django 2.1.15 on 2020-05-18 17:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('KBL', '0027_auto_20200518_1739'),
    ]

    operations = [
        migrations.CreateModel(
            name='Project_Manage_Detail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(default='', max_length=64)),
                ('project_details', models.CharField(default='', max_length=256)),
                ('note', models.CharField(default='', max_length=256)),
                ('date', models.CharField(default='0000-00-00', max_length=10)),
                ('check', models.CharField(default='0', max_length=2)),
                ('use_yn', models.CharField(default='Y', max_length=2)),
                ('registrant', models.CharField(default='', max_length=4)),
                ('date_register', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('modifier', models.CharField(default='', max_length=4)),
                ('date_modify', models.CharField(default='0000-00-00 00:00:00', max_length=20)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='KBL.Project_Manage')),
            ],
        ),
    ]
