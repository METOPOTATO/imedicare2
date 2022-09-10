# Generated by Django 2.1.15 on 2020-05-07 20:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Manage', '0019_board_file_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='draft',
            name='name_en_accounting',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_en_ceo',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_en_in_charge',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_en_leader',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_ko_accounting',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_ko_ceo',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_ko_in_charge',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_ko_leader',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_vi_accounting',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_vi_ceo',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_vi_in_charge',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='name_vi_leader',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='user_id_accounting',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='user_id_ceo',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='user_id_in_charge',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='draft',
            name='user_id_leader',
            field=models.CharField(default='', max_length=32),
        ),
    ]
