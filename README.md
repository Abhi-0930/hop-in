# Hop-In

Student transportation management platform connecting parents, drivers, and administrators.

## Project Structure

```
hop-in/
├── frontend/     # React + Vite + Tailwind CSS
├── backend/      # Firebase Cloud Functions (Phase 3+)
└── HOP-IN-PROJECT-SPECIFICATION.md
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Add your Firebase config to .env
npm run dev
```

### Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Storage
5. Add web app and copy config to `frontend/.env`

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Firebase
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions)

## Security

- **Firestore rules:** `firestore.rules` — Deploy with `firebase deploy --only firestore`
- **Storage rules:** `storage.rules` — Deploy with `firebase deploy --only storage`
- **Audit:** See `SECURITY-AUDIT.md` for full security review
