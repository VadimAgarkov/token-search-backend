###### Token Search Backend

Backend-сервис для поиска токенов с использованием Redis, Prometheus и Docker.

---

## Быстрый старт:

### Клонирование репозитория

```bash
git clone https://github.com/VadimAgarkov/token-search-backend.git
cd token-search-backend

Запуск через Docker Compose

Проект собран в Docker, запуск происходит через docker-compose.

docker-compose up --build

После этого сервис будет доступен по адресу:
http://localhost:3000


В стек входит:

    Node.js 20 (Alpine)

    Redis — кэширование

    Prometheus — мониторинг

    Grafana — отключена (конфигурация удалена)

    Tempo — отключён (конфигурация удалена)

Переменные окружения

В корне проекта используется .env с базовыми настройками:

PORT=3000
REDIS_URL=redis://redis:6379
CACHE_TTL_SEC=60
LOG_LEVEL=info

Информация по Grafana и Tempo

В текущей версии проекта Grafana и Tempo отключены из-за отсутствия успеха в формировании файлов для автоматической развертки.

Использование

    Сервис слушает порт 3000

    Кэширование происходит через Redis

    Метрики доступны через Prometheus на порту 9090

Полезные команды

    Запуск сервиса

docker-compose up --build

    Остановка

docker-compose down

    Проверка логов сервиса

docker-compose logs -f app

```
