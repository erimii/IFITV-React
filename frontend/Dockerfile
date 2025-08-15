# 1) Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2) Serve
FROM nginx:alpine
# Nginx 설정 먼저 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 빌드 산출물 복사 (중복 제거: 한 번만 복사)
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
