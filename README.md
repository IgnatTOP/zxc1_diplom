# DanceWave 2.0

Laravel 12 + Inertia React (TypeScript) проект с FSD-структурой фронтенда, миграцией legacy-данных из `zxc1/`, mock-платежами, личным кабинетом, поддержкой с realtime (Reverb) и Telegram webhook.

## Стек

- Backend: Laravel 12, SQLite, Reverb, queue (database)
- Frontend: Inertia.js 2, React 18, TypeScript, Tailwind, shadcn/ui + Radix
- Infra: Docker Compose + Supervisor

## Быстрый старт

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
npm install
npm run build
php artisan serve
```

## Импорт legacy данных и медиа

Legacy источник: `./zxc1`.

```bash
php artisan legacy:import
```

Параметры:

```bash
php artisan legacy:import --path=/abs/path/to/app.sqlite --media-path=/abs/path/to/images
php artisan legacy:import --skip-media
```

## Основные маршруты

- Публичные: `/`, `/about`, `/directions`, `/schedule`, `/gallery`, `/blog`, `/blog/{slug}`, `/prices`
- Кабинет: `/profile`
- Админка: `/admin/*`
- API: `/api/v1/*`
- SEO: `/sitemap.xml`, `/robots.txt`

## Новый функционал

- Mock-платежи: `POST /api/v1/payments/checkout`
- Личный кабинет: группы, персональное расписание, история и ближайшие платежи
- Новости секций по активным enrollment
- Поддержка (гость + авторизованный) с realtime-синхронизацией
- Ответы админа из веб-админки и Telegram webhook

## Docker

```bash
docker compose up --build
```

Приложение полностью поднимается одним сервисом `app`:

- `php artisan serve --host=0.0.0.0 --port=8000`
- `php artisan queue:work`
- `php artisan reverb:start --host=0.0.0.0 --port=8080`
- `php artisan migrate --force` и `php artisan db:seed --force` на старте контейнера

Порты по умолчанию:

- HTTP: `8000`
- Reverb WS: `18080` (внутри контейнера `8080`)

При необходимости можно переопределить:

```bash
APP_PORT=8001 REVERB_EXTERNAL_PORT=18081 docker compose up --build
```

По умолчанию `vite` не запускается. Для dev-hot-reload используйте профиль:

```bash
docker compose --profile dev up --build
```

Доступы после базового сида:

- `admin@dancewave.ru / password`
- `test@example.com / password`

Опционально можно включить миграцию legacy-данных при старте:

```bash
RUN_LEGACY_IMPORT=true docker compose up --build
```

## Тесты

```bash
php artisan test
```

## Важные env переменные

```env
BROADCAST_CONNECTION=reverb
LEGACY_DB_PATH=zxc1/diplo/data/app.sqlite
LEGACY_MEDIA_PATH=zxc1/diplo/assets/images

TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```
