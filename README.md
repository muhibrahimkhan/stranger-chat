# Stranger Chat

A real-time chat platform that randomly pairs strangers from around the world for a text conversation — with AI-powered interest matching and live translation, instead of pure random pairing.

## Features

- **Real-time 1:1 chat** via WebSockets (Socket.io) — instant matching and messaging, no page refreshes.
- **Content-based smart matching** — instead of pairing whoever's waited longest, users are matched using **TF-IDF vectorization + cosine similarity** over their stated interests, so people with shared, specific interests (not just common ones) are prioritized for pairing.
- **Live translation** — when two matched users speak different languages, messages are automatically translated, with the original text shown alongside the translation, and a safe fallback if the translation service is unavailable.
- **Moderation** — a profanity filter with a 3-strike system that disconnects repeat offenders.
- **Rate limiting** — a hand-built token bucket algorithm throttles message spam per connection, rather than relying on an off-the-shelf middleware.
- **Persistent moderation (MongoDB)** — bans are tied to IP address and stored with a TTL index so they auto-expire after 24 hours; user reports are logged with reporter/reported/room details.
- **Analytics event log** — connections, matches (with similarity score), skips, disconnects, kicks, and translation failures are logged as events, enabling aggregate queries about match quality and engagement.
- **JWT-authenticated admin API** — a single-admin login (bcrypt-hashed password, signed JWT) protects `/admin/reports` and `/admin/bans` endpoints.
- **Security hardening** — `helmet` for protective HTTP headers, `cors` for cross-origin control, and input validation on the admin login route.

## Tech stack

- **Node.js** + **Express** — server, static file hosting, and admin REST API
- **Socket.io** — real-time, bidirectional communication
- **MongoDB** + **Mongoose** — persistence for bans, reports, and analytics events
- **JWT** + **bcrypt** — admin authentication
- **Vanilla HTML/CSS/JS** — frontend, no framework
- Custom **TF-IDF + cosine similarity** implementation for matching (no ML library — built from scratch)

## Architecture

The backend is organized in layers rather than one large file:

```
src/
  server.js             # entry point — wires Express + Socket.io + Mongo together
  config/               # environment/database configuration
  middleware/           # requireAdmin — JWT auth guard for protected routes
  routes/               # admin REST routes (login, reports, bans)
  sockets/              # "waiter" layer — listens for connection/socket events, no business logic
  services/             # "chef" layer — pure business logic, no knowledge of Socket.io
    matching.service.js       # TF-IDF vectorization + cosine similarity
    translation.service.js    # third-party translation call with safe fallback
    moderation.service.js     # profanity filtering
    rateLimiter.service.js    # token bucket rate limiting
    auth.service.js           # admin credential verification + JWT issuing/verifying
    analytics.service.js      # fire-and-forget event logging
  models/               # Mongoose schemas: Ban, Report, Event
scripts/
  hashPassword.js        # one-off utility to generate the admin password hash
public/                  # static frontend (HTML/CSS/JS)
```

Business logic lives in `services/`, independent of the transport layer, so it can be reasoned about (and tested) on its own.

## Running locally

```
npm install
node src/server.js
```

Then open `http://localhost:3000` in two separate browser tabs to test matching and chat.

Create a `.env` file in the project root with:

```
PORT=3000
MONGODB_URI=<your MongoDB Atlas connection string>
ADMIN_USERNAME=<your chosen admin username>
ADMIN_PASSWORD_HASH=<generated via node scripts/hashPassword.js "your-password">
JWT_SECRET=<a random secret string>
```

### Admin API

```
POST /admin/login        -> { username, password } returns { token }
GET  /admin/reports       (Authorization: Bearer <token>)
GET  /admin/bans          (Authorization: Bearer <token>)
```

## Roadmap

- [x] MongoDB persistence for reports and bans (with TTL auto-expiry)
- [x] Admin authentication (JWT) for a reports/bans API
- [x] Security hardening (helmet, CORS, input validation)
- [x] Deployment to a live URL

## Why this project

Built as a hands-on way to demonstrate backend engineering fundamentals: real-time systems, a genuine (from-scratch) content-based matching algorithm, safe third-party API integration, abuse mitigation, persistence, authentication, and — next — production deployment.
