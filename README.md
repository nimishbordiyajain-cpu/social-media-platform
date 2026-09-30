# Social Media Post Sharing Platform
Backend Development (Node.js, Express.js, MongoDB) - Final Project

Users can register, log in, create text posts, like/unlike posts and comment on them.
A user can edit or delete **only their own** posts and comments. Everything is protected by JWT.

## Folder structure
```
social-media-platform/
├── backend/
│   ├── server.js                 # entry point: middlewares, routes, error handler
│   ├── config/db.js              # MongoDB Atlas connection
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Post.js               # author (ref User), likes[] (refs User)
│   │   └── Comment.js            # post (ref Post), author (ref User)
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── ownership.js          # ownership-based authorization
│   │   └── validate.js           # input validation
│   ├── controllers/              # business logic
│   ├── routes/                   # URL -> middleware -> controller mapping
│   ├── postman/                  # Postman / Thunder Client collection
│   └── .env.example              # PORT, MONGO_URI, JWT_SECRET
└── frontend/                     # React (Vite) basic UI
    └── src/pages, components, api.js, AuthContext.jsx
```

## Run locally

### 1. Backend
```
cd backend
npm install
```
Open `.env` and set:
- `MONGO_URI` = your MongoDB Atlas connection string (Atlas -> Connect -> Drivers)
- `JWT_SECRET` = any long random text

In Atlas also: Network Access -> allow your IP (or 0.0.0.0/0 for testing).
```
npm run dev        # http://localhost:5000
```

### 2. Frontend
```
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### 3. Test the API
Import `backend/postman/Social-Media-API.postman_collection.json` in Postman or Thunder Client.
Run **Register** (token is saved automatically), then the other requests in order.
The folder "Negative tests" shows 401 / 400 / 403 cases - good to demo in viva.

## API endpoints
| Method | URL | Auth | Who can do it |
|---|---|---|---|
| POST | /api/auth/register | No | anyone |
| POST | /api/auth/login | No | anyone |
| GET | /api/posts | JWT | any logged-in user |
| GET | /api/posts/:id | JWT | any logged-in user |
| POST | /api/posts | JWT | any logged-in user |
| PATCH | /api/posts/:id | JWT | **post owner only** |
| DELETE | /api/posts/:id | JWT | **post owner only** |
| POST | /api/posts/:id/like | JWT | toggles like/unlike |
| GET | /api/posts/:id/comments | JWT | any logged-in user |
| POST | /api/posts/:id/comments | JWT | any logged-in user |
| PATCH | /api/comments/:id | JWT | **comment owner only** |
| DELETE | /api/comments/:id | JWT | **comment owner only** |

Token is sent as header: `Authorization: Bearer <token>`

## Requirement checklist
| Requirement | Where |
|---|---|
| User, Post, Comment schemas | `backend/models/` |
| JWT authentication for all interactions | `middleware/auth.js`, `router.use(protect)` |
| Ownership-based authorization | `middleware/ownership.js` |
| Like/unlike toggle | `postController.toggleLike` |
| Validate content before saving | `middleware/validate.js` + schema validators |
| Unauthenticated requests rejected | `protect` returns 401 |
| Like counts accurate | count = `likes.length` (array of unique user ids) |
| Referenced collections | `ref: 'User'`, `ref: 'Post'` + `populate()` |
| .env config | `.env.example` |
| Postman collection | `backend/postman/` |

## Deployment
**Backend (Render):** New Web Service -> connect GitHub repo -> Root Directory `backend` ->
Build `npm install`, Start `npm start` -> add env vars `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL). Render sets `PORT` itself.

**Frontend (Vercel/Netlify):** Root Directory `frontend`, build `npm run build`, output `dist` ->
env var `VITE_API_URL=https://<your-render-app>.onrender.com/api`.

---

# Viva preparation

## How one request flows (say this first)
`Client -> route -> auth middleware (JWT) -> ownership middleware -> validation -> controller -> Mongoose model -> MongoDB -> JSON response`

## Likely questions and short answers

**Q1. What is JWT and how did you use it?**
JSON Web Token. After login the server signs a token containing the user id using `JWT_SECRET`. The client sends it in the `Authorization` header on every request. The `protect` middleware verifies the signature and expiry, loads the user and puts it in `req.user`. If invalid -> 401.

**Q2. Authentication vs Authorization?**
Authentication = who are you (JWT check, 401). Authorization = are you allowed to do this (ownership check, 403). 

**Q3. How did you implement ownership?**
`checkOwnership(Model)` finds the post/comment, compares `doc.author` with `req.user._id`. If different -> 403 Forbidden. Same middleware is reused for posts and comments.

**Q4. How does like/unlike work?**
Post has a `likes` array of user ids. If my id is already inside, I remove it (unlike), otherwise I add it (like). The like count is `likes.length`, so a user can never like twice and the count is always correct.

**Q5. Why store passwords with bcrypt?**
Plain passwords are dangerous if the DB leaks. bcrypt hashes with a salt (one-way), and `bcrypt.compare` checks login. 

**Q6. What is referencing vs embedding? Which did you use?**
Referencing stores only the `ObjectId` of another document (`author: ref 'User'`); embedding puts the whole sub-document inside. I used referencing, and `populate()` to fetch the username. Comments are a separate collection because a post can have many comments and they are edited/deleted independently.

**Q7. What is middleware?**
A function with `(req, res, next)` that runs between request and response. I made auth, ownership and validation middleware. `next()` passes control forward.

**Q8. How do you validate data?**
Two layers: `validate.js` middleware rejects empty/too long text with 400 before hitting the DB, and Mongoose schema rules (`required`, `maxlength`) are a second safety net.

**Q9. Why PATCH and not PUT?**
PATCH updates only the given field (content); PUT replaces the whole resource.

**Q10. What status codes did you use?**
200 OK, 201 Created, 400 Bad Request (validation), 401 Unauthorized (no/invalid token), 403 Forbidden (not the owner), 404 Not Found, 500 Server error.

**Q11. Why is `author` taken from the token and not from the request body?**
If it came from the body, a user could pretend to be someone else. Using `req.user._id` from the verified token is safe.

**Q12. What does `.env` do? Why not commit it?**
Stores secrets (DB password, JWT secret) outside code. It is in `.gitignore`; `.env.example` shows the needed keys.

**Q13. What happens when a post is deleted?**
Its comments are deleted too (`Comment.deleteMany`) so no orphan comments remain.

**Q14. What is CORS?**
Browser rule that blocks a frontend on one origin from calling an API on another. The `cors` package tells the browser our frontend is allowed.

**Q15. What is `timestamps: true`?**
Mongoose automatically adds `createdAt` and `updatedAt`.

**Q16. How would you improve it?**
Pagination, image upload, refresh tokens, rate limiting, `express-validator`, notifications.

## Demo script for the exam (2 minutes)
1. Register user A, create a post. 2. Register user B, like and comment on A's post; like again to show unlike.
3. As B try to edit A's post (Postman) -> 403. 4. Call `/api/posts` without token -> 401.
5. Send an empty post -> 400.
