# Use Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose Django port
EXPOSE 8000

# Run Gunicorn server (production ready)
CMD ["gunicorn", "SSO_Backend.wsgi:application", "--bind", "0.0.0.0:8000"]
