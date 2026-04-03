# 🏠 Boarding Finder — Backend API

> RESTful API server for the Boarding Finder platform — a web application to help students find boarding houses near universities across Sri Lanka.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?logo=mongodb)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 📋 Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Seeding the Database](#seeding-the-database)
- [Author](#author)

---

## About

The Boarding Finder backend is a Node.js/Express REST API that powers the full boarding house listing platform. It handles user authentication, boarding listings, favorites, inquiries, ratings, admin management, and AI-powered listing generation using Claude (Anthropic).

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Multer | Image/file uploads |
| @anthropic-ai/sdk | AI listing generation via Claude |
| dotenv | Environment variable management |

---

## Features

- 🔐 **JWT Authentication** — Register, login, logout with 7-day tokens
- 🚫 **Ban System** — Admins can ban/unban users; banned users are blocked from login and all protected routes instantly
- 🏠 **Boarding Listings** — Full CRUD with image uploads (up to 8 photos), location, amenities, room type
- ❤️ **Favorites** — Users can save and manage favourite listings
- 📩 **Inquiries** — Students can send visit requests to listing owners
- ⭐ **Ratings & Reviews** — Users can rate and review boarding places
- 🗺️ **Map Coordinates** — Lat/lng support for map-based browsing
- 🤖 **AI Listing Writer** — Generate and improve listing descriptions using Claude AI
- 👮 **Admin Panel API** — Manage users, listings, view stats, promote/demote admins
- 📸 **Avatar Uploads** — Profile photo upload and management
- 🔑 **Password Reset** — Secure token-based password reset flow

---

## Project Structure

```
server/
├── middleware/
│   ├── auth.js           # JWT protect middleware (ban check included)
│   └── admin.js          # Admin-only route guard
├── models/
│   ├── User.js           # User schema (name, email, password, isAdmin, isBanned, avatar)
│   ├── Boarding.js       # Boarding listing schema
│   ├── Inquiry.js        # Inquiry schema
│   └── Rating.js         # Rating/review schema
├── routes/
│   ├── auth.js           # Auth routes (register, login, profile, avatar, password reset)
│   ├── boardings.js      # Boarding CRUD routes
│   ├── favorites.js      # Favorites routes
│   ├── inquiries.js      # Inquiry routes
│   ├── ratings.js        # Rating routes
│   ├── admin.js          # Admin routes (users, ban, promote, stats)
│   └── ai.js             # AI listing generation routes
├── uploads/              # Uploaded images (auto-created)
│   └── avatars/          # Profile photos
├── server.js             # App entry point
├── seed.js               # Database seeder
├── .env                  # Environment variables (not committed)
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ravindu200324511398/boarding-finder.git
cd boarding-finder/server

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Then fill in your values (see Environment Variables section)

# 4. Seed the database with sample data (optional)
node seed.js

# 5. Start the development server
npm run dev

# Or for production
npm start
```

The server will run at: `http://localhost:5001`

---

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/boarding_finder
JWT_SECRET=your_super_secret_jwt_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

| Variable | Description |
|---|---|
| `PORT` | Port to run the server on (default: 5001) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `ANTHROPIC_API_KEY` | API key from [Anthropic Console](https://console.anthropic.com) for AI features |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login (returns JWT token) |
| GET | `/me` | ✅ | Get current user info |
| GET | `/profile` | ✅ | Get profile + listings |
| PUT | `/profile` | ✅ | Update name, email, password |
| POST | `/avatar` | ✅ | Upload profile photo |
| DELETE | `/avatar` | ✅ | Remove profile photo |
| POST | `/forgot-password` | ❌ | Request password reset token |
| POST | `/reset-password/:token` | ❌ | Reset password with token |

### Boardings — `/api/boardings`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | Get all listings (with filters) |
| POST | `/` | ✅ | Create new listing |
| GET | `/:id` | ❌ | Get single listing |
| PUT | `/:id` | ✅ | Update listing (owner only) |
| DELETE | `/:id` | ✅ | Delete listing (owner only) |
| PATCH | `/:id/availability` | ✅ | Toggle available/occupied |

### Favorites — `/api/favorites`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get user's favourites |
| POST | `/:boardingId` | ✅ | Add to favourites |
| DELETE | `/:boardingId` | ✅ | Remove from favourites |

### Inquiries — `/api/inquiries`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/:boardingId` | ❌ | Send inquiry to owner |
| GET | `/` | ✅ | Get inquiries for your listings |
| GET | `/mine` | ✅ | Get inquiries you sent |

### Ratings — `/api/ratings`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:boardingId` | ❌ | Get ratings for a listing |
| POST | `/:boardingId` | ✅ | Submit rating and review |
| DELETE | `/:boardingId` | ✅ | Delete your rating |

### Admin — `/api/admin` (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Dashboard statistics |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user detail + listings |
| DELETE | `/users/:id` | Delete user and their listings |
| PATCH | `/users/:id/toggle-admin` | Promote/demote admin |
| PATCH | `/users/:id/toggle-ban` | Ban/unban user |
| GET | `/boardings` | List all boardings |
| DELETE | `/boardings/:id` | Delete any boarding |

### AI — `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/generate-listing` | ✅ | Generate title + description using Claude AI |
| POST | `/improve-listing` | ✅ | Improve existing description using Claude AI |

---

## Seeding the Database

The seed script creates sample users and boarding listings across Sri Lanka:

```bash
node seed.js
```

After seeding, use these credentials:

```
👤 ADMIN
   Email:    admin@boardingfinder.com
   Password: admin123

👤 USERS
   kasun@example.com    / password123
   nimasha@example.com  / password123
   ravindu@example.com  / password123
```

> ⚠️ The seed script deletes all existing data before inserting new records.

---

## Ban System

When a user is banned by an admin:

- ❌ They **cannot log in** — login returns a `403` error with a clear message
- ❌ All **protected API routes** return `403 Forbidden` immediately, even with a valid token
- ✅ **Unbanning** restores full access instantly on next login

The middleware fetches the user fresh from the database on every request, so banning takes effect immediately without waiting for the token to expire.

---

## Author

**Ravindu Saranga**
- GitHub: [@Ravindu200324511398](https://github.com/Ravindu200324511398)

---

## License

This project is licensed under the MIT License.
