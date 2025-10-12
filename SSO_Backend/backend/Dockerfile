# 1. Use Python base image
FROM python:3.10-slim

# 2. Environment settings
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Set working directory
WORKDIR /app

# 4. Install system dependencies (for psycopg2/Postgres)
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# 5. Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the Django project
COPY . .

# 7. Expose port 8000
EXPOSE 8000

# 8. Run Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
