# Hop-In Backend

Backend services for Hop-In student transportation platform.

## Structure

- **Firebase Cloud Functions** — Geo-fence alerts, push notifications, server-side logic
- Future: Custom API endpoints if needed

## Setup

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init functions` (if not already done)
4. Deploy: `npm run deploy`

## Phase 3+ (Real-Time Features)

Cloud Functions will be added for:
- Geo-fence distance calculations
- FCM push notifications
- Admin notifications
