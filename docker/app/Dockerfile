FROM composer:2 AS vendor

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-dev \
    --no-scripts

COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes
COPY artisan ./artisan
RUN composer dump-autoload --optimize --no-dev --no-scripts

FROM node:22-alpine AS frontend

WORKDIR /var/www/html

ARG VITE_APP_NAME=DanceWave
ARG VITE_REVERB_APP_KEY=dancewavekey
ARG VITE_REVERB_HOST=localhost
ARG VITE_REVERB_PORT=18080
ARG VITE_REVERB_SCHEME=http

ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_REVERB_APP_KEY=${VITE_REVERB_APP_KEY}
ENV VITE_REVERB_HOST=${VITE_REVERB_HOST}
ENV VITE_REVERB_PORT=${VITE_REVERB_PORT}
ENV VITE_REVERB_SCHEME=${VITE_REVERB_SCHEME}

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json vite.config.js postcss.config.js tailwind.config.js ./
COPY resources ./resources
COPY public ./public
COPY --from=vendor /var/www/html/vendor/tightenco/ziggy ./vendor/tightenco/ziggy

RUN npm run build

FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    bash \
    curl \
    git \
    libzip-dev \
    oniguruma-dev \
    sqlite-dev \
    supervisor \
    unzip \
    zip

RUN docker-php-ext-install pdo pdo_sqlite mbstring pcntl zip

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /var/www/html/vendor ./vendor
COPY --from=frontend /var/www/html/public/build ./public/build
COPY --from=frontend /var/www/html/bootstrap/ssr ./bootstrap/ssr

COPY docker/app/supervisord.conf /etc/supervisor/supervisord.conf
COPY docker/supervisor/*.conf /etc/supervisor/conf.d/
COPY docker/app/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p \
        /var/www/html/storage/app/public \
        /var/www/html/storage/framework/cache \
        /var/www/html/storage/framework/sessions \
        /var/www/html/storage/framework/views \
        /var/www/html/storage/logs \
        /var/www/html/bootstrap/cache

EXPOSE 8000 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
