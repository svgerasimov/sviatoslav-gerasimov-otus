# Best Courses Ever – образовательная платформа

|             |                                                |
| ----------- | ---------------------------------------------- |
| **Backend** | Node 20 + Express 4 (MVC)                      |
| **Шаблоны** | «Чистый» EJS + Tailwind CDN                    |
| **Данные**  | In-memory репозитории (User / Course / Lesson) |
| **Тесты**   | Jest + Supertest (CRUD API)                    |

---

## Установка и запуск

```bash
git clone https://…/best-courses-ever.git
cd best-courses-ever
npm i
npm run dev           # nodemon src/server.js
```

| URL                    | Что отдаёт            |
| ---------------------- | --------------------- |
| `/`                    | Главная страница      |
| `/courses`             | HTML-список курсов    |
| `/login`, `/register`  | Формы авторизации     |
| `/courses/api`         | JSON-массив курсов    |
| `/courses/:id/lessons` | JSON занятий курса    |
| `/api/health`          | Ping: `{status:"ok"}` |

---

## Скрипты npm

| Скрипт  | Описание                             |
| ------- | ------------------------------------ |
| `dev`   | nodemon + перезапуск при изменениях  |
| `start` | обычный старт (`node src/server.js`) |
| `test`  | Jest + Supertest (все API-тесты)     |
| `lint`  | ESLint (standard style)              |

---

## Структура каталогов

```
src/
  app.js            # регистрирует middlewares и роуты
  server.js         # точка входа
  routes/           # index, auth, users, courses (+ lessons)
  controllers/      # бизнес-логика
  repositories/     # in-memory хранилища
  models/           # POJO-классы
  views/            # EJS-шаблоны   (partials/header|footer.ejs)
public/
  (пусто — Tailwind по CDN)
tests/
  courses.test.js   # CRUD курсов
  auth.test.js      # регистрация / 501-логин
```

---

## Что дальше ⏭️

- Подключить реальную БД (PostgreSQL / MongoDB) вместо in-memory репо.
- Реализовать полноценный login/logout (cookie-session или JWT).
- Добавить роли (USER, AUTHOR, ADMIN) и защиту маршрутов.
- Расширить UI — страницы профиля, редактор курса, оценки ★.
