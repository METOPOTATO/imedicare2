# Generated by Django 2.1.15 on 2020-01-03 21:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0003_auto_20200101_1048'),
        ('Pharmacy', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='medicinelog',
            name='reception',
        ),
        migrations.AddField(
            model_name='medicinelog',
            name='diagnosis',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='Receptionist.Diagnosis'),
        ),
        migrations.AlterField(
            model_name='medicinelog',
            name='changes',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='medicinelog',
            name='type',
            field=models.CharField(choices=[('new', 'new'), ('add', 'add'), ('dec', 'decrese'), ('not', 'notusing')], max_length=4),
        ),
    ]
