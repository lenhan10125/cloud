FROM python:3.11-slim

# Cài đặt Node.js, FFmpeg, curl VÀ unzip (để cài Deno)
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    ffmpeg \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt Deno (JS runtime dự phòng)
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

WORKDIR /app

# Cài đặt thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code
COPY . .

# Chạy ứng dụng
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]