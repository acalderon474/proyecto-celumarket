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

# Elimina la página por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos compilados de Angular
COPY --from=build /app/dist/proyecto-celumarket/browser/ /usr/share/nginx/html/

# Angular generó index.csr.html, por eso lo dejamos también como index.html
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then \
        cp /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi

EXPOSE 80