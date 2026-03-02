# Run Hop-In with Firebase Emulators (Bypass Network Blocking)

When your network blocks Firebase, use **local emulators** instead. Everything runs on your machine.

---

## Step 1: Install Firebase CLI

```bash
cd f:\Client-Projects\hop-in
npm install
```

## Step 2: Login to Firebase (one-time)

```bash
npx firebase login
```

## Step 3: Start Emulators

**Terminal 1** - Start Firebase emulators:
```bash
cd f:\Client-Projects\hop-in
npm run emulators
```
Keep this running. You'll see:
- Auth: http://127.0.0.1:9099
- Firestore: http://127.0.0.1:8080
- Storage: http://127.0.0.1:9199
- Emulator UI: http://127.0.0.1:4000

## Step 4: Start the App

**Terminal 2** - Start the frontend:
```bash
cd f:\Client-Projects\hop-in\frontend
npm run dev
```

## Step 5: Use the App

Open http://localhost:5173 (or 5174)

- **Sign up** - Creates user in local emulator
- **Data** - Stored in local Firestore emulator
- **No internet** needed for Firebase

---

## Your .env

Already set: `VITE_USE_EMULATORS=true` — app connects to local emulators.

To use **real Firebase** again (when network works): set `VITE_USE_EMULATORS=false`

---

## Emulator UI

Open http://127.0.0.1:4000 to view/edit emulator data (users, Firestore, etc.)

---

## Troubleshooting

### `ERR_BLOCKED_BY_CLIENT` or Firestore/Auth requests failing

**Ad blockers** (uBlock Origin, AdBlock, Privacy Badger, etc.) often block requests to `127.0.0.1` and `localhost`. Fix:

1. **Disable the extension** for localhost: Click the extension icon → disable for this site
2. Or **whitelist** `127.0.0.1` and `localhost` in the extension settings
3. Or use **Incognito/Private** with extensions disabled

### Parent signup fails with 400

If you already signed up as **driver** with an email, you can't use the same email for **parent**. Use a different email (e.g. `parent@test.com` vs `driver@test.com`).
