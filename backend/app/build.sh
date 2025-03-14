#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Ma'lumotlar bazasi jadvallarini yaratish
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)" 