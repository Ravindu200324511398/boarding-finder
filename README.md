# 🏠 Boarding Finder System

A full-stack web application for university students to find, list, and save boarding places.

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth, Multer
- **Frontend**: React, React Router v6, Bootstrap 5, Leaflet Maps, Axios

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`)
- npm

---

### 1. Clone / Setup Project
```bash
mkdir boarding-finder && cd boarding-finder
```

### 2. Backend Setup
```bash
mkdir server && cd server
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors multer express-async-errors
npm install --save-dev nodemon
mkdir uploads
```

Copy all backend files into the `server/` folder.

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/boarding_finder
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ..
npx create-react-app client
cd client
npm install axios react-router-dom leaflet react-leaflet bootstrap react-icons
```

Copy all frontend files into the `client/src/` folder, replacing the defaults.

---

### 4. Run the App

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Server starts at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```
App opens at: `http://localhost:3000`

---

## 📁 Project Structure
```
boarding-finder/
├── server/
│   ├── server.js           # Entry point
│   ├── .env                # Environment variables
│   ├── uploads/            # Uploaded images stored here
│   ├── middleware/
│   │   └── auth.js         # JWT protection middleware
│   ├── models/
│   │   ├── User.js         # User schema
│   │   └── Boarding.js     # Boarding schema
│   └── routes/
│       ├── auth.js         # Register/Login routes
│       ├── boardings.js    # CRUD for boardings
│       └── favorites.js    # Favorites management
└── client/
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.css       # Global styles
        ├── api/axios.js    # Axios with JWT interceptor
        ├── context/AuthContext.js
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Home.jsx
            ├── AddBoarding.jsx
            ├── BoardingDetail.jsx
            ├── Favorites.jsx
            └── MapPage.jsx
```

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login, get JWT |
| GET | /api/auth/me | Yes | Get profile |
| GET | /api/boardings | No | List/search boardings |
| GET | /api/boardings/:id | No | Single boarding |
| POST | /api/boardings | Yes | Add boarding + image |
| PUT | /api/boardings/:id | Yes (owner) | Update boarding |
| DELETE | /api/boardings/:id | Yes (owner) | Delete boarding |
| GET | /api/favorites | Yes | Get user favorites |
| POST | /api/favorites/:id | Yes | Add favorite |
| DELETE | /api/favorites/:id | Yes | Remove favorite |

## 🌍 Map Setup

When adding a boarding, enter latitude and longitude coordinates:
1. Go to [Google Maps](https://maps.google.com)
2. Right-click on your location
3. Click the coordinates shown to copy them
4. Enter lat/lng in the Add Boarding form

## 🔒 Security Notes

- Never commit `.env` to Git — add it to `.gitignore`
- Change `JWT_SECRET` to a long random string in production
- Use HTTPS in production
- Consider cloud storage (Cloudinary) for images in production
