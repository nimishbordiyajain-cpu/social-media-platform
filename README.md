<div align="center">

# PostBoard: Social Media Post Sharing Platform

A full-stack mini social network where authenticated users create posts, like them and comment on them.
Built with **Node.js, Express.js, MongoDB (Mongoose) and React**, secured with **JWT authentication** and **ownership-based authorization**.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Project Structure](#project-structure)
6. [Database Design](#database-design)
7. [API Reference](#api-reference)
8. [Security](#security)
9. [Getting Started](#getting-started)
10. [Testing the API](#testing-the-api)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Future Improvements](#future-improvements)
14. [Author](#author)

---

## Overview

PostBoard is a REST API with a lightweight React client. Only signed-in users can see or interact with the feed.
Users can write short text posts, like or unlike them, and discuss them in comments. Every user can edit or delete
**only their own** posts and comments; the server enforces this rule, not the interface.

This project was built for the **Backend Development (Node.js, Express.js and MongoDB)** course, B.Tech Computer Science
Engineering, ITM Skills University (Project 119: *Social Media Post Sharing Platform*). All validation and business
logic lives in the backend. The frontend only calls the REST API.

## Features

| Area | What it does |
|---|---|
| **Authentication** | Register and log in. Passwords are hashed with bcrypt and sessions use signed JWTs. |
| **Posts** | Create, read, edit and delete text posts (max 500 characters). |
| **Comments** | Add, list, edit and delete comments on a post (max 200 characters). |
| **Likes** | One-click like/unlike toggle. A user can like a post only once, so counts stay accurate. |
| **Authorization** | Ownership middleware blocks editing or deleting other people's posts and comments (HTTP 403). |
| **Protected feed** | Requests without a valid token are rejected (HTTP 401). |
| **Validation** | Input is checked in middleware and again by Mongoose schema rules. |
| **Data integrity** | Deleting a post also deletes its comments, so no orphan documents remain. |
| **Frontend** | Login/Register, feed with inline composer, Add/Edit form, and a post details page with comments. |

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express.js |
| Database | MongoDB Atlas with Mongoose ODM |
| Authentication | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| Other backend packages | `cors`, `dotenv`, `nodemon` (dev) |
| Frontend | React 18, Vite, React Router, Axios |
| Deployment | Render (API), Vercel or Netlify (client), MongoDB Atlas (database) |

## System Architecture

```
┌──────────────────┐      HTTPS / JSON       ┌───────────────────────────┐        ┌──────────────┐
│  React (Vite)    │ ──────────────────────▶ │  Express.js REST API      │ ─────▶ │ MongoDB Atlas│
│  localhost:5173  │ ◀────────────────────── │  localhost:5001           │ ◀───── │  (Mongoose)  │
└──────────────────┘   Authorization: Bearer └───────────────────────────┘        └──────────────┘
                              <JWT>
```

**Request lifecycle for a protected route** (for example `PATCH /api/posts/:id`):

```
Request → CORS → JSON parser → auth (verify JWT) → ownership (is author?) → validation → controller → Mongoose → Response
              └─ 401 if token is missing/invalid  └─ 403 if not owner       └─ 400 if bad input
```

## Project Structure

```
social-media-platform/
├── backend/
│   ├── server.js                   # App entry point: middleware, routes, error handling
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js                 # username, email, hashed password
│   │   ├── Post.js                 # content, author (ref), likes[] (refs)
│   │   └── Comment.js              # text, post (ref), author (ref)
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   ├── ownership.js            # ownership-based authorization
│   │   └── validate.js             # request validation
│   ├── controllers/
│   │   ├── authController.js       # register, login
│   │   ├── postController.js       # posts CRUD, like toggle
│   │   └── commentController.js    # comments CRUD
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   └── commentRoutes.js
│   ├── postman/                    # Postman / Thunder Client collection
│   └── .env.example                # Environment variable template
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx, App.jsx       # Bootstrap and routing
│       ├── api.js                  # Axios instance with JWT interceptor
│       ├── AuthContext.jsx         # Login state shared across the app
│       ├── utils.js
│       ├── components/             # Navbar, PostCard, CommentSection, Avatar, ...
│       └── pages/                  # Login, Register, Feed, PostForm, PostDetails
│
└── README.md
```

## Database Design

The three collections are **referenced** (linked by ObjectId) rather than embedded, and `populate()` joins them when reading.

```
┌────────────┐ 1        * ┌────────────┐ 1        * ┌────────────┐
│    User    │────────────│    Post    │────────────│  Comment   │
└────────────┘   author   └────────────┘    post    └────────────┘
       │                        │ likes[] (User ids)        │
       └────────────────────────┘                           │
       └────────────────────── author ──────────────────────┘
```

| Collection | Field | Type | Rules |
|---|---|---|---|
| **User** | `username` | String | required, unique, 3-30 characters |
| | `email` | String | required, unique, valid format, lowercase |
| | `password` | String | required, min 6 characters, stored as bcrypt hash |
| **Post** | `content` | String | required, trimmed, 1-500 characters |
| | `author` | ObjectId → User | required |
| | `likes` | [ObjectId → User] | one entry per user; count = `likes.length` |
| **Comment** | `text` | String | required, trimmed, 1-200 characters |
| | `post` | ObjectId → Post | required |
| | `author` | ObjectId → User | required |

All collections use `timestamps: true` (`createdAt`, `updatedAt`).

## API Reference

Base URL: `http://localhost:5001/api`

Protected routes need the header `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Access | Body |
|---|---|---|---|
| POST | `/auth/register` | Public | `{ "username", "email", "password" }` |
| POST | `/auth/login` | Public | `{ "email", "password" }` |

Both return the user's `_id`, `username`, `email` and a `token`.

### Posts

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/posts` | Logged in | Feed, newest first, with comment counts |
| GET | `/posts/:id` | Logged in | Single post |
| POST | `/posts` | Logged in | Create a post: `{ "content" }` |
| PATCH | `/posts/:id` | **Owner only** | Edit a post: `{ "content" }` |
| DELETE | `/posts/:id` | **Owner only** | Delete a post and its comments |
| POST | `/posts/:id/like` | Logged in | Toggle like/unlike; returns `liked` and `likesCount` |

### Comments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/posts/:id/comments` | Logged in | List comments of a post |
| POST | `/posts/:id/comments` | Logged in | Add a comment: `{ "text" }` |
| PATCH | `/comments/:id` | **Owner only** | Edit a comment: `{ "text" }` |
| DELETE | `/comments/:id` | **Owner only** | Delete a comment |

### Status codes

| Code | Meaning | Example |
|---|---|---|
| 200 / 201 | Success / created | Post created |
| 400 | Validation error | Empty post, text too long, duplicate email |
| 401 | Not authenticated | Missing, invalid or expired token |
| 403 | Not authorized | Editing someone else's post |
| 404 | Not found | Post or comment does not exist |
| 500 | Server error | Unexpected failure |

## Security

- **Password hashing:** bcrypt with 10 salt rounds; plain-text passwords are never stored.
- **JWT authentication:** tokens are signed with `JWT_SECRET` and expire (default 7 days). Every post and comment route requires one.
- **Ownership authorization:** a reusable middleware compares the document's `author` with the logged-in user before any edit or delete.
- **Trusted identity:** the author of a new post or comment is taken from the verified token, never from the request body.
- **Input validation:** length and required-field checks run before the controller, with Mongoose schema validation as a second layer.
- **Generic login errors:** wrong email and wrong password return the same message.
- **Secrets in environment variables:** `.env` is git-ignored; only `.env.example` is committed.
- **CORS:** restricted to the configured `CLIENT_URL`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/nimishbordiyajain-cpu/social-media-platform.git
cd social-media-platform
```

### 2. Set up MongoDB Atlas

1. Create a free **M0** cluster.
2. **Database Access → Add New Database User.** Choose a username and a password with letters and numbers only.
3. **Network Access → Add IP Address → Allow Access From Anywhere** (`0.0.0.0/0`).
4. **Database → Connect → Drivers**, then copy the connection string.

### 3. Configure and start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/socialdb?retryWrites=true&w=majority
JWT_SECRET=use_a_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> Put the database name (`socialdb`) after `.mongodb.net/`. Without it, MongoDB saves your data in a database called `test`.

```bash
npm run dev
```

Expected output:

```
Server running on port 5001
MongoDB connected -> host: ... | database: socialdb
```

### 4. Configure and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

```bash
npm run dev
```

Open **http://localhost:5173**.

### Environment variables

| File | Variable | Description |
|---|---|---|
| `backend/.env` | `PORT` | Port for the API (5001 avoids the macOS AirPlay conflict on 5000) |
| | `MONGO_URI` | MongoDB Atlas connection string, including the database name |
| | `JWT_SECRET` | Secret used to sign tokens |
| | `JWT_EXPIRES_IN` | Token lifetime, for example `7d` |
| | `CLIENT_URL` | Allowed frontend origin for CORS |
| `frontend/.env` | `VITE_API_URL` | Backend API base URL, ending with `/api` |

## Testing the API

1. Import `backend/postman/Social-Media-API.postman_collection.json` into **Postman** or **Thunder Client**.
2. Run **Register** first. The token is saved automatically and reused by the other requests.
3. Run the requests in order: create post, like, comment, edit, delete.
4. Open the **Negative tests** folder to see the protection working:

| Test | Expected result |
|---|---|
| Get feed without a token | `401 Unauthorized` |
| Create an empty post | `400 Bad Request` |
| Create a post over 500 characters | `400 Bad Request` |
| Edit another user's post | `403 Forbidden` |

## Deployment

| Part | Platform | Settings |
|---|---|---|
| Database | MongoDB Atlas | Allow `0.0.0.0/0` in Network Access |
| Backend | Render (Web Service) | Root directory `backend`, build `npm install`, start `npm start`. Add `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your frontend URL). Render provides `PORT` automatically. |
| Frontend | Vercel or Netlify | Root directory `frontend`, build `npm run build`, output `dist`. Add `VITE_API_URL=https://<your-backend>.onrender.com/api`. |

Deploy the backend first, then put its URL into the frontend's `VITE_API_URL`, then set the frontend's URL as `CLIENT_URL` on the backend. On Render's free tier the API sleeps when idle, so the first request after a pause can take about 30 seconds.

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| `EADDRINUSE: address already in use :::5000` | On macOS, AirPlay Receiver uses port 5000. Use `PORT=5001` (the default here). |
| `The uri parameter ... got "undefined"` | `backend/.env` does not exist. Run `cp .env.example .env` and fill it in. |
| `bad auth` / `Authentication failed` | Wrong Atlas username or password in `MONGO_URI`, or special characters in the password. |
| Timeout or `ENOTFOUND` connecting to Atlas | Add `0.0.0.0/0` under Network Access and wait a minute. |
| Frontend shows `Route not found` | `VITE_API_URL` is missing `/api` at the end. |
| Frontend shows `Network Error` | Backend is not running, or the ports in the two `.env` files differ. |
| `.env` change has no effect | `.env` is read only at startup. Restart both servers. |
| Data missing in the `socialdb` database | `MONGO_URI` has no database name, so data went to `test`. |

## Future Improvements

- Pagination or infinite scroll for the feed
- Image uploads for posts
- Refresh tokens and logout on all devices
- Rate limiting and `helmet` security headers
- Automated tests with Jest and Supertest
- Notifications for likes and comments

## Author

**Nimish Bordiya**
B.Tech Computer Science Engineering, ITM Skills University
GitHub: [@nimishbordiyajain-cpu](https://github.com/nimishbordiyajain-cpu)
