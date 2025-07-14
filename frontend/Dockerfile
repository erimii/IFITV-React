# 1단계: 빌드 단계 (Build Stage)
FROM node:20 AS build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: 실제 서비스에 쓸 Nginx로 결과 서빙
FROM nginx:alpine

# 빌드된 결과물을 Nginx 디렉토리로 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정 파일 덮어쓰기 (필요 시)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 오픈
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# nginx로 복사할 때 설정파일도 같이
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf