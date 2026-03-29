#🏠 Boarding Finder — Backend (Server)

## Tech Stack
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** — Authentication
- **Multer** — Image / avatar file uploads
- **bcryptjs** — Password hashing
- **dotenv** — Environment variables

---

## 📁 Folder Structure

```
server/
├── models/
│   ├── User.js          # User schema (name, email, password, avatar, favorites, resetToken)
│   ├── Boarding.js      # Boarding listing schema
│   └── Rating.js        # Rating/review schema
├── routes/
│   ├── auth.js          # Register, login, profile, forgot/reset password, avatar
│   ├── boardings.js     # CRUD for boarding listings
│   ├── favorites.js     # Add/remove/get favorites
│   ├── admin.js         # Admin-only routes
│   └── ratings.js       # Ratings routes
├── middleware/
│   └── auth.js          # JWT protect middleware
├── uploads/
│   ├── (boarding images stored here)
│   └── avatars/         # Profile photo uploads stored here
├── seed.js              # Default seed data (run once to populate DB)
├── server.js            # Entry point
├── .env                 # Environment variables (create this manually)
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Create `.env` file
Create a file called `.env` inside the `server/` folder:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/boarding_finder
JWT_SECRET=boarding_finder_super_secret_key_2024
```

### 3. Make sure MongoDB is running
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod

# Windows — start MongoDB service from Services panel
```

### 4. Seed default data (first time only)
This creates default admin and user accounts plus sample boarding listings.
```bash
cd server
node seed.js
```

### 5. Start the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5001**

---

## 🔑 Default Login Credentials

> These are created when you run `node seed.js`

### 👑 Admin Account
| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@boarding.com`   |
| Password | `admin123`             |
| Role     | Admin                  |

### 👤 User Account 1
| Field    | Value                  |
|----------|------------------------|
| Email    | `john@example.com`     |
| Password | `user1234`             |
| Name     | John Perera            |
| Role     | User                   |

### 👤 User Account 2
| Field    | Value                  |
|----------|------------------------|
| Email    | `sarah@example.com`    |
| Password | `user1234`             |
| Name     | Sarah Fernando         |
| Role     | User                   |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint                          | Auth Required | Description                  |
|--------|-----------------------------------|---------------|------------------------------|
| POST   | `/api/auth/register`              | No            | Register new user            |
| POST   | `/api/auth/login`                 | No            | Login, returns JWT token     |
| GET    | `/api/auth/me`                    | Yes           | Get current user info        |
| GET    | `/api/auth/profile`               | Yes           | Get profile + listings       |
| PUT    | `/api/auth/profile`               | Yes           | Update name / email / password |
| POST   | `/api/auth/avatar`                | Yes           | Upload profile photo         |
| DELETE | `/api/auth/avatar`                | Yes           | Remove profile photo         |
| POST   | `/api/auth/forgot-password`       | No            | Generate password reset link |
| POST   | `/api/auth/reset-password/:token` | No            | Reset password with token    |
| DELETE | `/api/auth/profile/boarding/:id`  | Yes           | Delete own listing           |

### Boardings
| Method | Endpoint                  | Auth Required | Description            |
|--------|---------------------------|---------------|------------------------|
| GET    | `/api/boardings`          | No            | Get all listings       |
| GET    | `/api/boardings/:id`      | No            | Get single listing     |
| POST   | `/api/boardings`          | Yes           | Create new listing     |
| PUT    | `/api/boardings/:id`      | Yes           | Update listing         |
| DELETE | `/api/boardings/:id`      | Yes           | Delete listing         |

### Favorites
| Method | Endpoint                      | Auth Required | Description              |
|--------|-------------------------------|---------------|--------------------------|
| GET    | `/api/favorites`              | Yes           | Get user's favorites     |
| POST   | `/api/favorites/:boardingId`  | Yes           | Add to favorites         |
| DELETE | `/api/favorites/:boardingId`  | Yes           | Remove from favorites    |

### Admin
| Method | Endpoint                    | Admin Only | Description           |
|--------|-----------------------------|------------|-----------------------|
| GET    | `/api/admin/users`          | Yes        | List all users        |
| GET    | `/api/admin/users/:id`      | Yes        | Get user detail       |
| DELETE | `/api/admin/users/:id`      | Yes        | Delete user           |
| GET    | `/api/admin/boardings`      | Yes        | List all boardings    |
| DELETE | `/api/admin/boardings/:id`  | Yes        | Delete any boarding   |
| GET    | `/api/admin/stats`          | Yes        | Dashboard stats       |

---

## 🗂️ File Upload Details

- **Boarding images** — saved to `server/uploads/`
- **Avatar photos** — saved to `server/uploads/avatars/`
- **Max avatar size** — 3 MB
- **Allowed formats** — JPG, PNG, WEBP, GIF
- **Served at** — `http://localhost:5001/uploads/` and `http://localhost:5001/uploads/avatars/`

---

## 🔒 How Authentication Works

1. User logs in → server returns a **JWT token**
2. Frontend stores the token in `localStorage`
3. All protected requests include the header:
   ```
   Authorization: Bearer <token>
   ```
4. The `protect` middleware verifies the token on every protected route

---

## 🔐 Forgot Password Flow (Dev Mode)

Since no email server is configured, the reset link is **returned directly in the API response** instead of being sent by email. This is for development/demo purposes only.

1. POST `/api/auth/forgot-password` with `{ email }` → get back `resetUrl`
2. Open the `resetUrl` in the browser
3. POST `/api/auth/reset-password/:token` with `{ password }` → password is reset

In production, replace the `resetUrl` response with `nodemailer` or any email service (SendGrid, Resend, Mailgun).

---

## 📦 Key Dependencies

```json
"dependencies": {
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "express": "^4.18.0",
  "jsonwebtoken": "^9.0.0",
  "mongoose": "^7.0.0",
  "multer": "^1.4.5"
}
```

Install with:
```bash
npm install bcryptjs cors dotenv express jsonwebtoken mongoose multer
npm install --save-dev nodemon
```

---

## 🚀 npm Scripts

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seed.js"
}
```

---

## ❓ Common Issues

| Issue | Fix |
|-------|-----|
| `MongoServerError: connection refused` | Start MongoDB service first |
| `JWT malformed` | Check that `.env` has `JWT_SECRET` set |
| `Cannot POST /api/auth/login` | Make sure server is running on port 5001 |
| Avatar upload fails | Check `uploads/avatars/` folder exists (seed.js creates it) |
| CORS error | Frontend must run on `http://localhost:3000` or update CORS origin in `server.js` |
