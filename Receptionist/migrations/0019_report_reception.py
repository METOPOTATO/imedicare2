# Generated by Django 2.1.15 on 2020-04-06 13:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0018_diagnosis_icd_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='reception',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='Receptionist.Reception'),
        ),
    ]
