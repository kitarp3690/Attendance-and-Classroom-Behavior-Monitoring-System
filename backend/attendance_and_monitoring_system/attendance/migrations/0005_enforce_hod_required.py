from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0004_remove_class_semester_old_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='department',
            name='hod',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='headed_departments',
                to=settings.AUTH_USER_MODEL,
                limit_choices_to={'role': 'hod'}
            ),
        ),
        migrations.AddConstraint(
            model_name='department',
            constraint=models.UniqueConstraint(fields=('hod',), name='unique_hod_per_department'),
        ),
    ]
