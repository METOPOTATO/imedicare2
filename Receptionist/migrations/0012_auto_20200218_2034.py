# Generated by Django 2.1.15 on 2020-02-18 20:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0011_first_visit_survey_cure_yn'),
    ]

    operations = [
        migrations.RenameField(
            model_name='first_visit_survey',
            old_name='visit_motiv',
            new_name='visit_motiv_item',
        ),
        migrations.AddField(
            model_name='first_visit_survey',
            name='visit_motiv_etc',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='first_visit_survey',
            name='visit_motiv_friend',
            field=models.CharField(max_length=18, null=True),
        ),
    ]
