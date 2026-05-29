# Проект SkillSwap

Платформа обмена навыками «Я научу / Хочу научиться»

## Документация

- [Техническое задание](https://docs.google.com/document/d/1d4o9Sb9o6lxXuqdEgKe4eRlH2s7gKrh0icJ3gyv2FD4/edit?tab=t.0#heading=h.ynonjn54b672)
- [Макет](https://www.figma.com/design/bKwOakHJI7Z2mh2zVCBphP/SkillSwap---Для-разработчиков?node-id=0-1&p=f&t=HH7S4bYwVVtxLM6z-0)

## Стек

- **Backend:** NestJS, TypeORM, PostgreSQL
- **Frontend:** React, Vite, Redux Toolkit
- **Инфраструктура:** Docker, Docker Compose

## Структура репозитория

Монорепозиторий с двумя приложениями:

```
SkillSwap_41_1/
├── backend/              # REST API
├── frontend/             # веб-клиент
└── docker-compose.yml    # PostgreSQL, backend, frontend
```

## Быстрый старт

Схема БД поднимается через миграции (synchronize выключен). Команды `migration:run` и `seed:prod` выполняются из папки backend на машине локально.

**Всё в Docker**
1. Клонировать репозиторий и перейти в корень проекта.
2. `docker compose up -d`
3. Подготовить БД:
   - `cd backend`
   - `.env.example` => `.env`
   - `npm install`
   - `npm run migration:run`
   - `npm run seed:prod`

**Локальный запуск:** 
1. Можно поднять только БД в Docker (`docker compose up -d db`) и запускать backend и/или frontend на хосте.

## Сервисы: 

- Frontend: http://localhost:8080
- API: http://localhost:3000
- Swagger: http://localhost:3000/api

Подробнее о проекте: [backend/README.md](./backend/README.md), [frontend/README.md](./frontend/README.md).
