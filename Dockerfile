FROM python:3.11-slim

# Azure Speech SDK needs OpenSSL, CA certificates and ALSA on Linux
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libssl3 libasound2 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY voice_server ./voice_server

EXPOSE 8080
CMD ["uvicorn", "--factory", "voice_server.app:create_app", "--host", "0.0.0.0", "--port", "8080", \
     "--proxy-headers", "--forwarded-allow-ips", "*"]
