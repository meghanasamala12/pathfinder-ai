# PathFinder AI Backend
FROM python:3.12-slim

WORKDIR /app

# System deps: build tools, image libs (Pillow: jpeg/png/zlib), OpenSSL, libxml2/libxslt, PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    zlib1g-dev \
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    libssl-dev \
    libxml2-dev \
    libxslt1-dev \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Rust for bcrypt (no s390x prebuilt wheel)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

COPY requirements.txt requirements-linuxone.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements-linuxone.txt

COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
