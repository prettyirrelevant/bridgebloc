#!/usr/bin/env sh

echo "Starting Gunicorn server..."
gunicorn bridgebloc.conf.wsgi --capture-output --log-level info --workers 4 --daemon

echo "Starting Huey consumer..."
python manage.py run_huey