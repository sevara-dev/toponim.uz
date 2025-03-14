#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Wait for PostgreSQL to be ready
sleep 10

# Create database tables
cd /opt/render/project/src/backend/app
python -c "
import time
from database import engine
from models import Base

max_retries = 5
current_try = 0

while current_try < max_retries:
    try:
        Base.metadata.create_all(bind=engine)
        print('Database tables created successfully')
        break
    except Exception as e:
        current_try += 1
        if current_try == max_retries:
            raise e
        print(f'Failed to create tables (attempt {current_try}/{max_retries}). Retrying in 5 seconds...')
        time.sleep(5)
"

# Make sure the script is executable
chmod +x build.sh 