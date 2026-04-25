# Nexiva

<p align="center">
  <img
    src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=28&pause=1100&color=FF9C66&center=true&vCenter=true&width=900&lines=Nexiva+%E2%80%94+social+feed%2C+chat%2C+and+real-time+notifications;React+%2B+Vite+frontend;Express+%2B+MongoDB+%2B+Socket.io+backend;Built+as+a+full-stack+social+media+MVP"
    alt="Animated Nexiva header"
  />
</p>

<p align="center">
  Nexiva is a full-stack social media MVP with profiles, an image-led feed, direct messaging, and live notifications.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb?style=for-the-badge&logo=react&logoColor=0b111b" alt="React + Vite" />
  <img src="https://img.shields.io/badge/backend-Express%20%2B%20Socket.io-111827?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Express + Socket.io" />
  <img src="https://img.shields.io/badge/database-MongoDB-0f766e?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/auth-JWT-f59e0b?style=for-the-badge" alt="JWT auth" />
</p>

## Overview

Nexiva combines the main surfaces of a lightweight social platform into one workspace:

- profile creation and editing
- feed posts with optional images
- likes and comments
- direct messages
- live notifications for activity
- backend storage that can run on local disk or S3

This repository is structured as a real MVP, not a mockup. The frontend and backend both run, the API is tested, and the storage layer is already prepared for local and S3-backed uploads.

## Product Flow

1. A user registers or logs in.
2. They land on the feed and can publish text and image posts.
3. Other users can like and comment on those posts.
4. Users can open direct conversations and exchange messages in real time.
5. Notifications surface likes, comments, and messages as they happen.

## Stack

### Frontend

- React
- Vite
- React Router
- Socket.io client

### Backend

- Node.js
- Express
- Socket.io
- MongoDB with Mongoose
- JWT authentication
- Multer uploads
- S3-compatible storage support

### Testing / Hardening

- Node test runner
- Supertest
- mongodb-memory-server
- express-rate-limit

## Project Structure

```text
Nexiva/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   └── utils/
│   ├── test/
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   └── .env.example
├── package.json
└── README.md
```

## Features

### Auth

- register and login with JWT
- protected app routes
- current-user lookup

### Feed

- create posts with optional image upload
- like posts
- comment on posts
- see the latest feed activity

### Messaging

- search users
- create or reuse a conversation
- fetch message history
- send live Socket.io messages

### Notifications

- like notifications
- comment notifications
- message notifications
- mark all read

### Profile

- edit name, bio, and avatar
- upload avatar images through the same backend upload flow

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start the app

Normal dev flow:

```bash
npm run dev
```

This starts the frontend and backend together.

If you do not want to run MongoDB locally:

```bash
npm run dev:memory
```

### 4. Useful individual commands

```bash
npm run dev:frontend
npm run dev:backend
npm run dev:backend:memory
npm run build --workspace frontend
npm test --workspace backend
```

## Environment

### Frontend

`frontend/.env`

```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend

`backend/.env`

```bash
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/nexiva
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
JSON_BODY_LIMIT=1mb
MAX_UPLOAD_FILE_SIZE_BYTES=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
STORAGE_DRIVER=local
STORAGE_PUBLIC_BASE_URL=
S3_BUCKET_NAME=
S3_REGION=
S3_ENDPOINT=
S3_FORCE_PATH_STYLE=false
S3_KEY_PREFIX=uploads
```

## Storage Modes

### Local

Use this for fast development:

```bash
STORAGE_DRIVER=local
```

Uploads are stored on disk and served from `/uploads/...`.

### S3

Use this for production-style object storage:

```bash
STORAGE_DRIVER=s3
S3_BUCKET_NAME=your-bucket
S3_REGION=your-region
```

If you are using AWS S3 with standard public object URLs, `STORAGE_PUBLIC_BASE_URL` can be omitted.

If you are using a CDN, custom domain, or S3-compatible provider, set:

```bash
STORAGE_PUBLIC_BASE_URL=https://your-public-assets-domain
```

## API / Backend Notes

- controllers are intentionally thin
- auth, post, chat, notification, and storage logic are pushed into services
- request validation is applied before handlers
- auth and general API rate limiting are enabled
- backend API tests cover auth, feed, chat, and notifications

## README Animation

This README already includes an animated header using an SVG typing banner, which renders directly on GitHub.

If you want richer motion on the repo page later, add your own demo GIFs or MP4 previews under a folder like `docs/media/` and embed them here with standard Markdown or HTML `<img>` tags.

## Status

Current repository status:

- full-stack app structure is in place
- backend is tested
- frontend has been visually upgraded
- uploads support both local storage and S3

## Next Good Steps

- add follow/follower flows
- improve chat UI with unread states and timestamps
- add upload-specific frontend previews and progress states
- add deployment config for frontend and backend
- add demo GIFs/screenshots for the GitHub page
