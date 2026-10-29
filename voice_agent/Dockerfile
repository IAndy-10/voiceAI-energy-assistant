FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY voice_agent/requirements-voice.txt ./
RUN pip install --no-cache-dir -r requirements-voice.txt
COPY voice_agent ./voice_agent
RUN mkdir -p /var/lib/vesta-voice
RUN python -m voice_agent.smoke_test
EXPOSE 7860
CMD ["python", "-m", "voice_agent.webrtc_runner"]
