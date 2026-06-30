# 1. 빌드 스테이지
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 실행 스테이지 (Nginx)
FROM nginx:latest
# 빌드 결과물(dist 또는 build)을 Nginx 웹 루트로 복사
COPY --from=build /app/dist /usr/share/nginx/html
# 만약 custom Nginx 설정이 있다면 주석 해제 (나중에 API 연동할 때 필수)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]