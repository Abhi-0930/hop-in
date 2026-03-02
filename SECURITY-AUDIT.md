# Hop-In Security Audit Report

**Date:** March 2025  
**Status:** Audit Complete

---

## 1. Firestore Security Rules

### Implemented
- **`firestore.rules`** — Production-ready rules for all collections
- Role-based access via `get()` to read user role from `users` collection
- No custom claims required (role stored in Firestore)

### Collection Rules Summary

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `users` | Own only | Own only | Own + Admin (verification) | Own only |
| `schools` | Public | Admin | Admin | Admin |
| `vans` | Auth | Driver/Admin | Driver/Admin | Admin |
| `bookings` | Parent/Driver/Admin | Parent (own) | Admin | Admin |
| `reviews` | Auth | Parent (own) | Admin | Admin |
| `attendance` | Auth | Driver | Driver/Admin | Admin |
| `emergencyAlerts` | Auth | Parent/Driver | Admin/Reporter | Admin |
| `driverLocations` | Auth | Driver (own) | Driver (own) | Driver (own) |

### Deployment
```bash
firebase deploy --only firestore
```

---

## 2. Storage Security Rules

### Implemented
- **`storage.rules`** — Restricts uploads to own folder
- Max file size: 5MB
- Allowed types: images, PDF (for Aadhaar)

### Paths
- `drivers/{driverId}/*` — Driver uploads only
- `vans/{driverId}/*` — Driver uploads only

### Deployment
```bash
firebase deploy --only storage
```

---

## 3. Client-Side Security

### Protected Routes
- All role-specific dashboards use `ProtectedRoute`
- Checks: authenticated, profile exists, role matches

### Validation
- **Booking:** `childId` validated against parent's children before submit
- **QR Scanner:** Child enrolled in van before creating attendance
- **Signup:** Role restricted to `parent` or `driver` (no admin self-signup)

### Sensitive Data
- `.env` in `.gitignore` — API keys not committed
- Aadhaar stored as `****1234` (last 4 only) in Firestore

---

## 4. Identified Gaps & Remediations

| Issue | Severity | Status |
|-------|----------|--------|
| Admin can self-signup (role in signup) | Medium | Mitigated: Signup only allows parent/driver. Admin must be created manually in Firestore. |
| No rate limiting on auth | Low | Firebase Auth has built-in rate limiting. |
| Schools readable without auth | Info | By design for landing search. |
| Booking childId validation | Medium | Fixed: Client validates child belongs to parent. |

---

## 5. Recommendations

1. **Deploy rules** — Switch from test mode to production rules
2. **Admin creation** — Create admin users via Firebase Console or Admin SDK only
3. **Aadhaar** — For production, consider server-side encryption before storage
4. **HTTPS** — Firebase Hosting serves over HTTPS by default

---

## 6. How to Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Init (if needed): `firebase init`
4. Deploy:
   ```bash
   firebase deploy --only firestore,storage
   ```

---

## 7. Test Mode vs Production

**Current (Test Mode):**  
- Firestore allows read/write for 30 days  
- Storage allows read/write  

**After deploying rules:**  
- All access enforced by `firestore.rules` and `storage.rules`  
- Unauthorized requests will be rejected
