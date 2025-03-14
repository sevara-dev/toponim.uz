#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Create database tables
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"

# Make sure the script is executable
chmod +x build.sh 