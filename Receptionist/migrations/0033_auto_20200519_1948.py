# Generated by Django 2.1.15 on 2020-05-19 19:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0032_package_manage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='package_manage',
            name='precedure',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='Doctor.Precedure'),
        ),
        migrations.AlterField(
            model_name='package_manage',
            name='reception',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='Receptionist.Reception'),
        ),
    ]
