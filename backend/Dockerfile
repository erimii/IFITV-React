# Python 기반 슬림 이미지
FROM python:3.10-slim

# 환경 변수 설정 (캐시 안 남기고, 로그 깨짐 방지)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 시스템 패키지 업데이트 및 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev \
    libssl-dev \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    openjdk-17-jdk \
    curl \
    && rm -rf /var/lib/apt/lists/*

    # JAVA_HOME 설정
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 나머지 소스 복사
COPY . .

# 포트 오픈
EXPOSE 8000

# Django 서버 실행
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
