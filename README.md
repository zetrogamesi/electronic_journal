# 📖 Электронный Журнал

Веб-приложение «Электронный журнал успеваемости» на **React + Node.js + MongoDB (Mongoose)**.

## Стек технологий

| Слой     | Технологии                                        |
|----------|---------------------------------------------------|
| Frontend | React 18, React Router 6, Vite, Axios             |
| Backend  | Node.js, Express 4, JWT, bcrypt, Mongoose         |
| Database | **MongoDB** (локально или MongoDB Atlas)          |

---

## Функциональность

- Регистрация / Авторизация (JWT, bcrypt)
- **Главная** — список журналов группы, поиск, статистика
- **Профиль** — смена имени и пароля
- **Создание журнала** (admin) — группа, предмет, даты уроков
- **Журнал** — таблица оценок, авто-сохранение, средний балл
- **Панель администратора** — пользователи, группы, предметы
- Toast-уведомления, ErrorBoundary, 404-страница

---

## ══════════════════════════════════════════
## КАК ПОДКЛЮЧИТЬ MONGODB — ПОШАГОВО
## ══════════════════════════════════════════

### Вариант 1 — Локальная MongoDB (Windows / macOS / Linux)

**Шаг 1: Скачать и установить MongoDB Community Server**

1. Откройте https://www.mongodb.com/try/download/community
2. Выберите вашу ОС и скачайте установщик
3. Установите с настройками по умолчанию

**Windows:** во время установки поставьте галочку "Install MongoDB as a Service"
— MongoDB будет запускаться автоматически при старте Windows.

**macOS (через Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Шаг 2: Проверить что MongoDB работает**
```bash
# Должно ответить: { ok: 1 }
mongosh --eval "db.adminCommand('ping')"
```

**Шаг 3: Настроить .env**
```bash
cd backend
cp .env.example .env
```
В файле `.env` оставить:
```
MONGO_URI=mongodb://localhost:27017/electronic_journal
JWT_SECRET=придумайте_длинную_строку_минимум_32_символа
```
База данных `electronic_journal` создастся **автоматически** при первом запуске.

---

### Вариант 2 — MongoDB Atlas (облако, бесплатно)

**Шаг 1: Создать аккаунт**
1. Откройте https://www.mongodb.com/cloud/atlas/register
2. Зарегистрируйтесь (можно через Google)

**Шаг 2: Создать бесплатный кластер**
1. Нажмите "Build a Cluster" → выберите **M0 Free**
2. Выберите регион (например, Frankfurt)
3. Нажмите "Create Cluster" (создание займёт 2–3 минуты)

**Шаг 3: Настроить доступ**
1. В левом меню: **Database Access** → "Add New Database User"
   - Username: `journaluser`
   - Password: придумайте надёжный пароль — **запишите его**
   - Role: `Atlas admin`
2. В левом меню: **Network Access** → "Add IP Address"
   - Для разработки нажмите "Allow Access from Anywhere" (0.0.0.0/0)

**Шаг 4: Получить строку подключения**
1. На главной странице кластера нажмите **Connect**
2. Выберите "Drivers"
3. Скопируйте строку вида:
   ```
   mongodb+srv://journaluser:<password>@cluster0.xxxxx.mongodb.net/
   ```

**Шаг 5: Настроить .env**
```bash
cd backend
cp .env.example .env
```
Вставьте строку подключения, заменив `<password>` на ваш пароль:
```
MONGO_URI=mongodb+srv://journaluser:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/electronic_journal?retryWrites=true&w=majority
JWT_SECRET=придумайте_длинную_строку_минимум_32_символа
```

---

## Быстрый старт (после настройки MongoDB)

### 1. Backend
```bash
cd backend
npm install
npm run dev
# ✅ Сервер: http://localhost:5000
# ✅ MongoDB подключена
# 🌱 Группы и предметы добавлены автоматически
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Приложение: http://localhost:5173
```

### 3. Первый вход
1. Откройте http://localhost:5173
2. Нажмите "Зарегистрироваться", введите имя, группу, пароль
3. Назначьте себя администратором:
```bash
cd backend
node make-admin.js "Ваше Имя"
# ✅ "Ваше Имя" теперь администратор.
```
4. Войдите снова — в навигации появятся пункты "Создать журнал" и "Управление"

---

## Структура проекта

```
electronic-journal/
├── backend/
│   ├── make-admin.js          ← скрипт назначения администратора
│   ├── .env.example           ← шаблон настроек
│   └── src/
│       ├── app.js             ← Express + запуск сервера
│       ├── db/
│       │   ├── connect.js     ← подключение к MongoDB
│       │   └── seed.js        ← начальные данные (группы, предметы)
│       ├── models/            ← Mongoose-схемы
│       │   ├── Group.js
│       │   ├── Subject.js
│       │   ├── User.js
│       │   └── Journal.js     ← журнал + колонки + студенты + оценки
│       ├── middleware/
│       │   └── auth.js        ← JWT проверка
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── journalController.js
│       │   └── gradeController.js
│       └── routes/
│           ├── auth.js
│           ├── users.js
│           └── journals.js
│
└── frontend/
    └── src/
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ErrorBoundary.jsx
        │   └── ToastContainer.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── HomePage.jsx
            ├── ProfilePage.jsx
            ├── CreateJournalPage.jsx
            ├── JournalPage.jsx
            ├── AdminPage.jsx
            └── NotFoundPage.jsx
```

---

## API Endpoints

| Метод  | URL                           | Доступ  | Описание                     |
|--------|-------------------------------|---------|------------------------------|
| POST   | /api/auth/register            | Все     | Регистрация                  |
| POST   | /api/auth/login               | Все     | Вход                         |
| GET    | /api/auth/me                  | Авториз.| Текущий пользователь         |
| GET    | /api/users/groups             | Все     | Список групп                 |
| POST   | /api/users/groups             | Admin   | Создать группу               |
| GET    | /api/users/subjects           | Все     | Список предметов             |
| POST   | /api/users/subjects           | Admin   | Создать предмет              |
| GET    | /api/users                    | Admin   | Все пользователи             |
| PUT    | /api/users/me                 | Авториз.| Обновить профиль             |
| PUT    | /api/users/:id/admin          | Admin   | Переключить права admin      |
| DELETE | /api/users/:id                | Admin   | Удалить пользователя         |
| GET    | /api/journals                 | Авториз.| Список журналов              |
| GET    | /api/journals/:id             | Авториз.| Журнал с оценками            |
| POST   | /api/journals                 | Admin   | Создать журнал               |
| DELETE | /api/journals/:id             | Admin   | Удалить журнал               |
| POST   | /api/journals/:id/columns     | Admin   | Добавить дату урока          |
| PUT    | /api/journals/grades/upsert   | Admin   | Сохранить оценку             |

---

## Безопасность

- Пароли хешируются с **bcrypt** (12 раундов)
- Аутентификация через **JWT** (7 дней)
- Все защищённые маршруты проверяют токен
- Студенты видят только журналы своей группы
- `passwordHash` скрыт в ответах API через `select: false`
