# Stage 1: Build (use Debian/glibc - Alpine/musl+s390x not supported by Rollup)
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Use relative API path for production (nginx will proxy /api to backend)
ENV VITE_API_BASE=/api/v1
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
