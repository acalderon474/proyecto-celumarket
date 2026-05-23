# ===============================
# Etapa 1: Compilar Angular
# ===============================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration production --base-href /

# ===============================
# Etapa 2: Servir Angular con Nginx
# ===============================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/proyecto-celumarket/browser /usr/share/nginx/html

EXPOSE 80