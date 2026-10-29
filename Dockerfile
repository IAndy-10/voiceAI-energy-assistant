# syntax=docker/dockerfile:1

FROM nginx:1.27-alpine AS dashboard
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY dashboard/dashboard.html /usr/share/nginx/html/dashboard.html

FROM python:3.11-slim AS energy-api
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY requirements-runtime.txt ./
RUN pip install --no-cache-dir -r requirements-runtime.txt
COPY energy_tools ./energy_tools
COPY voice_agent/web/dist ./voice_agent/web/dist
RUN mkdir -p /var/lib/vesta-agent
EXPOSE 8000
CMD ["uvicorn", "energy_tools.api:app", "--host", "0.0.0.0", "--port", "8000"]
