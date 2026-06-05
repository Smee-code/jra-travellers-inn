import os
import tempfile
from pathlib import Path

from django.conf import settings
from django.core.management import BaseCommand, call_command
from django.db import connections


class Command(BaseCommand):
    help = 'Transfer local SQLite data into the configured PostgreSQL default database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sqlite-path',
            default=str(settings.BASE_DIR / 'db.sqlite3'),
            help='Path to the source SQLite database.',
        )
        parser.add_argument(
            '--flush-target',
            action='store_true',
            help='Delete existing PostgreSQL rows before loading SQLite data.',
        )

    def handle(self, *args, **options):
        default_engine = settings.DATABASES['default']['ENGINE']
        if 'postgresql' not in default_engine:
            raise SystemExit('Set DATABASE_URL to your PostgreSQL/Supabase database before running this command.')

        sqlite_path = Path(options['sqlite_path'])
        if not sqlite_path.exists():
            raise SystemExit(f'Source SQLite database was not found: {sqlite_path}')

        connections.databases['sqlite_source'] = {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': str(sqlite_path),
        }

        self.stdout.write(self.style.WARNING('Applying migrations to PostgreSQL target...'))
        call_command('migrate', database='default', interactive=False, verbosity=options['verbosity'])

        if options['flush_target']:
            self.stdout.write(self.style.WARNING('Flushing PostgreSQL target before import...'))
            call_command('flush', database='default', interactive=False, verbosity=options['verbosity'])

        with tempfile.NamedTemporaryFile(mode='w+', suffix='.json', delete=False, encoding='utf-8') as fixture:
            fixture_path = fixture.name

        try:
            self.stdout.write(self.style.WARNING('Exporting SQLite data...'))
            call_command(
                'dumpdata',
                '--natural-foreign',
                '--natural-primary',
                exclude=['contenttypes', 'auth.Permission'],
                database='sqlite_source',
                output=fixture_path,
                verbosity=options['verbosity'],
            )

            self.stdout.write(self.style.WARNING('Loading data into PostgreSQL...'))
            call_command('loaddata', fixture_path, database='default', verbosity=options['verbosity'])
        finally:
            try:
                os.remove(fixture_path)
            except OSError:
                pass

        self.stdout.write(self.style.SUCCESS('SQLite data transfer to PostgreSQL completed.'))
