# Stranger Chat

A real-time chat platform that randomly pairs strangers from around the world for a text conversation — with AI-powered interest matching and live translation, instead of pure random pairing.

## Features

- **Real-time 1:1 chat** via WebSockets (Socket.io) — instant matching and messaging, no page refreshes.
- **Content-based smart matching** — instead of pairing whoever's waited longest, users are matched using **TF-IDF vectorization + cosine similarity** over their stated interests, so people with shared, specific interests (not just common ones) are prioritized for pairing.
- **Live translation** — when two matched users speak different languages, messages are automatically translated, with the original text shown alongside the translation, and a safe fallback if the translation service is unavailable.
- **Moderation** — a profanity filter with a 3-strike system that disconnects repeat offenders.
- **Rate limiting** — a hand-built token bucket algorithm throttles message spam per connection, rather than relying on an off-the-shelf middleware.

## Tech stack

- **Node.js** + **Express** — server and static file hosting
- **Socket.io** — real-time, bidirectional communication
- **Vanilla HTML/CSS/JS** — frontend, no framework
- Custom **TF-IDF + cosine similarity** implementation for matching (no ML library — built from scratch)

## Architecture

The backend is organized in layers rather than one large file:

```
src/
  server.js            # entry point — wires Express + Socket.io together
  sockets/              # "waiter" layer — listens for connection/socket events, no business logic
  services/             # "chef" layer — pure business logic, no knowledge of Socket.io
    matching.service.js       # TF-IDF vectorization + cosine similarity
    translation.service.js    # third-party translation call with safe fallback
    moderation.service.js     # profanity filtering
    rateLimiter.service.js    # token bucket rate limiting
  config/                # environment configuration
public/                  # static frontend (HTML/CSS/JS)
```

Business logic lives in `services/`, independent of the transport layer, so it can be tested and reasoned about on its own.

## Running locally

```
npm install
node src/server.js
```

Then open `http://localhost:3000` in two separate browser tabs to test matching and chat.

Create a `.env` file in the project root with:

```
PORT=3000
```

## Roadmap

Currently in progress / planned next:

- [ ] MongoDB persistence for reports and bans (with TTL auto-expiry)
- [ ] Admin authentication (JWT) for a reports/bans dashboard
- [ ] Security hardening (helmet, CORS, input validation)
- [ ] Deployment to a live URL

## Why this project

Built as a hands-on way to demonstrate backend engineering fundamentals: real-time systems, a genuine (from-scratch) content-based matching algorithm, safe third-party API integration, abuse mitigation, and — as the roadmap above is completed — persistence, auth, and deployment.
