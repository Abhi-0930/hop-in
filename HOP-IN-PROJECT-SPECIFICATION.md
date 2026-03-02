# Hop-In — Project Specification Document

> **Version:** 1.0  
> **Last Updated:** March 2, 2025  
> **Status:** Development Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technical Stack](#2-technical-stack)
3. [Database Schema](#3-database-schema)
4. [Core Features](#4-core-features)
5. [User Interfaces](#5-user-interfaces)
6. [Security Implementation](#6-security-implementation)
7. [Development Phases](#7-development-phases)
8. [Best Practices & Guidelines](#8-best-practices--guidelines)
9. [Key Calculations](#9-key-calculations)
10. [Deliverables](#10-deliverables)
11. [Important Notes](#11-important-notes)

---

## 1. Overview

### 1.1 Role & Objective

**Hop-In** is a student transportation management platform that connects:

| Stakeholder | Purpose |
|-------------|---------|
| **Parents** | Track children, manage bookings, receive alerts |
| **Drivers** | Manage routes, record attendance, share location |
| **Administrators** | Verify drivers, handle emergencies, monitor system |

### 1.2 Core Capabilities

- **Real-time tracking** — Live van location on map
- **QR-based attendance** — Scan-in/scan-out for children
- **Geo-fence alerts** — Notifications when van is near home
- **Role-based access** — Parent, Driver, Admin dashboards
- **Driver verification** — Aadhaar-based approval workflow

---

## 2. Technical Stack

### 2.1 Frontend

| Technology | Purpose |
|------------|---------|
| React.js | Latest stable version |
| HTML5, CSS3 | Responsive, mobile-first design |
| React Router | Navigation |
| React Context API or Redux | State management |

### 2.2 Backend & Services

| Service | Purpose |
|---------|---------|
| Firebase Authentication | Role-based auth (parent, driver, admin) |
| Firebase Firestore | NoSQL database |
| Firebase Cloud Messaging | Push notifications |
| Firebase Storage | Document/image uploads |

### 2.3 Mapping & Location

| Technology | Purpose |
|------------|---------|
| OpenStreetMap | Base map tiles |
| Leaflet.js / React-Leaflet | Map rendering |
| Geolocation API | Real-time tracking |
| Haversine formula | Distance calculations |

### 2.4 Additional Libraries

| Library | Purpose |
|---------|---------|
| `qrcode.react` or `react-qr-code` | QR code generation |
| `react-qr-scanner` or `html5-qrcode` | QR code scanning |
| `date-fns` or `dayjs` | Date handling |
| `react-hook-form` + `yup` | Form validation |

---

## 3. Database Schema

### 3.1 `users` Collection

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Unique identifier |
| `email` | string | User email |
| `role` | `'parent' \| 'driver' \| 'admin'` | User role |
| `name` | string | Full name |
| `phone` | string | Contact number |
| `createdAt` | timestamp | Registration date |

**Parent-specific fields:**

| Field | Type | Description |
|-------|------|-------------|
| `children` | array | List of child objects |

**Child object structure:**

| Field | Type | Description |
|-------|------|-------------|
| `childId` | string | Unique child ID |
| `name` | string | Child name |
| `age` | number | Child age |
| `schoolName` | string | School name |
| `homeAddress` | object | `{ street, latitude, longitude }` |
| `qrCode` | string | Unique QR identifier |
| `activeBookingId` | string \| null | Current booking reference |

**Driver-specific fields:**

| Field | Type | Description |
|-------|------|-------------|
| `aadhaarVerified` | boolean | Aadhaar verification status |
| `aadhaarNumber` | string | Encrypted Aadhaar |
| `aadhaarDocUrl` | string | Document URL in Storage |
| `verificationStatus` | `'pending' \| 'approved' \| 'rejected'` | Admin verification |
| `yearsOfExperience` | number | Experience in years |
| `vanDetails` | object | Van info (see below) |
| `performanceScore` | number | Calculated score |
| `overallRating` | number | Average rating |
| `totalReviews` | number | Review count |

**Van details object:**

| Field | Type | Description |
|-------|------|-------------|
| `vanId` | string | Van identifier |
| `photo` | string | Van image URL |
| `capacity` | number | Max capacity |
| `currentVacancy` | number | Available seats |
| `pricePerMonth` | number | Monthly price |

---

### 3.2 `schools` Collection

| Field | Type | Description |
|-------|------|-------------|
| `schoolId` | string | Unique identifier |
| `name` | string | School name |
| `address` | string | Full address |
| `latitude` | number | Geo coordinate |
| `longitude` | number | Geo coordinate |
| `city` | string | City name |

---

### 3.3 `vans` Collection

| Field | Type | Description |
|-------|------|-------------|
| `vanId` | string | Unique identifier |
| `driverId` | string | Driver reference |
| `schoolId` | string | School reference |
| `capacity` | number | Max capacity |
| `currentVacancy` | number | Available seats |
| `enrolledChildren` | array | `[{ childId, firstName, parentId }]` |
| `pricePerMonth` | number | Monthly price |
| `route` | array | `[{ latitude, longitude, order }]` |
| `pickupTime` | string | Morning pickup time |
| `dropTime` | string | Evening drop time |
| `isActive` | boolean | Van active status |

---

### 3.4 `bookings` Collection

| Field | Type | Description |
|-------|------|-------------|
| `bookingId` | string | Unique identifier |
| `parentId` | string | Parent reference |
| `childId` | string | Child reference |
| `driverId` | string | Driver reference |
| `vanId` | string | Van reference |
| `contractMonths` | number | 3–48 months |
| `monthlyPrice` | number | Monthly cost |
| `totalValue` | number | `monthlyPrice × contractMonths` |
| `startDate` | timestamp | Contract start |
| `endDate` | timestamp | Contract end |
| `status` | `'active' \| 'completed' \| 'cancelled'` | Booking status |
| `paymentStatus` | `'pending' \| 'completed'` | Payment status |
| `createdAt` | timestamp | Creation time |

---

### 3.5 `reviews` Collection

| Field | Type | Description |
|-------|------|-------------|
| `reviewId` | string | Unique identifier |
| `driverId` | string | Driver reference |
| `parentId` | string | Parent reference |
| `bookingId` | string | Booking reference |
| `rating` | number | 1–5 stars |
| `comment` | string | Review text |
| `createdAt` | timestamp | Creation time |
| `reportedAbuse` | boolean | Abuse flag |
| `moderatedByAdmin` | boolean | Admin moderation flag |

---

### 3.6 `attendance` Collection

| Field | Type | Description |
|-------|------|-------------|
| `attendanceId` | string | Unique identifier |
| `childId` | string | Child reference |
| `vanId` | string | Van reference |
| `date` | timestamp | Attendance date |
| `boardingTime` | timestamp | Pickup boarding time |
| `boardingLocation` | object | `{ lat, lng }` |
| `schoolArrivalTime` | timestamp | School arrival |
| `dropBoardingTime` | timestamp \| null | Drop boarding |
| `homeArrivalTime` | timestamp \| null | Home arrival |

---

### 3.7 `emergencyAlerts` Collection

| Field | Type | Description |
|-------|------|-------------|
| `alertId` | string | Unique identifier |
| `reportedBy` | string | User ID |
| `role` | `'parent' \| 'driver'` | Reporter role |
| `vanId` | string | Van reference |
| `description` | string | Alert description |
| `location` | object | `{ lat, lng }` |
| `timestamp` | timestamp | Report time |
| `status` | `'open' \| 'resolved'` | Alert status |
| `adminNotes` | string | Admin notes |

---

### 3.8 `driverLocations` Collection (Real-time)

| Field | Type | Description |
|-------|------|-------------|
| `driverId` | string | Driver reference |
| `vanId` | string | Van reference |
| `latitude` | number | Current latitude |
| `longitude` | number | Current longitude |
| `timestamp` | timestamp | Last update |
| `isActiveTrip` | boolean | Trip in progress |

---

## 4. Core Features

### 4.1 User Registration & Authentication

#### Parent Registration Flow

1. Create Firebase Auth account
2. Store user in Firestore with `role: 'parent'`
3. Allow adding multiple children with home addresses
4. Generate unique QR codes for each child

#### Driver Registration Flow

1. Create Firebase Auth account
2. Collect Aadhaar details and upload document
3. Store in Firestore with `verificationStatus: 'pending'`
4. Collect van details (photo, capacity, pricing)
5. Admin must approve before driver can accept bookings

#### Admin Login

- Pre-created admin accounts
- Access to admin dashboard for verification and monitoring

---

### 4.2 Driver Verification System

**Admin Verification Dashboard:**

- List all pending driver verification requests
- Show uploaded Aadhaar documents
- Approve/Reject with one click
- Update `verificationStatus` and `aadhaarVerified`
- Send notification to driver on approval

**Verified Badge Display:**

- Green "✓ Verified Driver" badge on van cards
- Prominent display on driver profile pages
- Filter: "Show only verified drivers"

---

### 4.3 School & Van Search

**Search Implementation:**

1. Search bar on homepage
2. Query Firestore `schools` by name (case-insensitive)
3. Fetch all vans for matching `schoolId`
4. Display van cards with:
   - Driver name, photo
   - Van photo
   - Capacity & vacancy
   - Price per month
   - Star rating
   - "View Details" button

**Van Detail Page:**

- Driver profile (Aadhaar status, experience, rating)
- Route preview on OpenStreetMap
- Enrolled children (first names only)
- Pickup/drop timings
- Reviews section
- "Book This Van" button

---

### 4.4 Reviews & Ratings System

**Submitting Reviews:**

1. Only parents with active/past bookings can review
2. Form: Star rating (1–5) + text comment
3. Save to `reviews` collection
4. Recalculate driver's `overallRating` and `totalReviews`
5. Update `performanceScore` (weighted: ratings, attendance, punctuality)

**Display Reviews:**

- Show all reviews on driver profile
- Sort by: Most recent, Highest rated, Lowest rated
- Reviews cannot be deleted by driver (admin moderation only)

---

### 4.5 Booking & Contract Management

**Booking Flow:**

1. Parent selects van
2. Choose contract period: 3–48 months dropdown
3. Display summary:
   - Monthly cost
   - Total contract value (`months × price`)
   - Pickup/drop times
   - Route map
4. **Static payment section** (labeled "Payment"):
   - Show UPI, Net Banking, Card icons
   - Button: "Complete Payment" (no actual processing)
5. Create booking document in Firestore
6. Update van's `enrolledChildren` and `currentVacancy`
7. Generate QR code for child

---

### 4.6 Real-Time Tracking & Geo-Fence Alerts

**Driver Location Tracking:**

```javascript
navigator.geolocation.watchPosition((position) => {
  firebase.firestore().collection('driverLocations').doc(driverId).set({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    isActiveTrip: true
  });
});
```

**Parent Live Map:**

- Display OpenStreetMap with van marker
- Update marker position in real-time via Firestore listener

**Geo-Fence Alert Logic:**

- Use Haversine formula for distance calculation
- Monitor driver location updates
- For each enrolled child:
  - If distance ≤ 1 km → "Van approaching — 1 km away"
  - If distance ≤ 0.5 km → "Van almost here — get ready!"
- Use Firebase Cloud Messaging for push notifications

---

### 4.7 QR Code Attendance System

**QR Code Generation (Parent Dashboard):**

- Each child gets unique QR containing:
  ```json
  {
    "childId": "abc123",
    "childName": "John",
    "parentId": "xyz789",
    "vanId": "van456"
  }
  ```
- Display using `react-qr-code` library

**QR Code Scanning (Driver App):**

1. Driver opens scanner during pickup
2. Scans child's QR code
3. Validate: Is `childId` enrolled in this van?
4. Create attendance record with `boardingTime`, `boardingLocation`
5. Send FCM notification: `"${childName} has boarded the van at ${time}"`

**School Arrival Notification:**

- Driver clicks "Mark School Arrival"
- Notify all parents: "Your child has safely reached school"

**Attendance History (Parent Dashboard):**

- Table: Date | Boarding Time | Arrival Time
- Filter by date range
- Export to CSV option

---

### 4.8 Emergency Response System

**Emergency Alert Button:**

- Red "Emergency" button on Parent/Driver dashboard
- On click: Create document in `emergencyAlerts` with:
  - `reportedBy`, `role`, `vanId`, `description`
  - `location`, `timestamp`, `status: 'open'`
- Send immediate FCM notification to all admins
- Display alert in admin dashboard with flashing indicator

**Admin Emergency Dashboard:**

- Real-time list of all emergency alerts
- Show location on map
- Contact information for reporter
- "Mark as Resolved" button

---

## 5. User Interfaces

### 5.1 Parent Dashboard

```
┌─────────────────────────────────────┐
│  Hop-In - Parent Dashboard          │
├─────────────────────────────────────┤
│  My Children:                        │
│  ┌─────────────────────┐            │
│  │ John, Age 10        │ [QR Code] │
│  │ Van: ₹2500/month    │            │
│  │ Driver: Rajesh ⭐4.5│            │
│  │ [Live Track] [Attendance]       │
│  └─────────────────────┘            │
│                                      │
│  Live Van Location:                  │
│  [OpenStreetMap with van marker]    │
│                                      │
│  Recent Notifications:               │
│  • Van approaching - 1km away       │
│  • John boarded at 7:15 AM          │
│  • Reached school safely            │
│                                      │
│  [Emergency Alert Button]           │
└─────────────────────────────────────┘
```

### 5.2 Driver Dashboard

```
┌─────────────────────────────────────┐
│  Hop-In - Driver Dashboard          │
├─────────────────────────────────────┤
│  Today's Route: Morning Pickup      │
│  Enrolled: 15/20 students           │
│                                      │
│  [Start Trip]  [Scan QR Code]       │
│                                      │
│  Attendance Status:                  │
│  ✓ John - 7:15 AM                   │
│  ✓ Priya - 7:18 AM                  │
│  ⏳ Waiting for 3 more...           │
│                                      │
│  [Mark School Arrival]              │
│                                      │
│  My Performance:                     │
│  Overall Rating: ⭐ 4.6 (48 reviews)│
│  Attendance Rate: 98.5%             │
│                                      │
│  [Emergency Alert Button]           │
└─────────────────────────────────────┘
```

### 5.3 Admin Dashboard

```
┌─────────────────────────────────────┐
│  Hop-In - Admin Dashboard           │
├─────────────────────────────────────┤
│  Pending Verifications: 5           │
│  Active Emergency Alerts: 0         │
│                                      │
│  Driver Verification Requests:      │
│  ┌─────────────────────┐            │
│  │ Rajesh Kumar        │            │
│  │ Aadhaar: ****7865   │            │
│  │ [View Document]     │            │
│  │ [Approve] [Reject]  │            │
│  └─────────────────────┘            │
│                                      │
│  System Stats:                       │
│  Total Vans: 245                    │
│  Active Bookings: 3,450             │
│  Verified Drivers: 230              │
└─────────────────────────────────────┘
```

---

## 6. Security Implementation

### 6.1 Data Protection

- Firebase Security Rules to restrict access by role
- Encrypt sensitive data (Aadhaar) before storage
- HTTPS for all communications
- Driver documents in Firebase Storage with restricted access

### 6.2 Firebase Security Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Only admins can approve drivers
    match /users/{userId} {
      allow update: if request.auth.token.role == 'admin' 
                    && request.resource.data.diff(resource.data).affectedKeys()
                    .hasOnly(['verificationStatus', 'aadhaarVerified']);
    }
    
    // Parents can only read vans, not modify
    match /vans/{vanId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['driver', 'admin'];
    }
    
    // Reviews: create by parents, moderate by admins
    match /reviews/{reviewId} {
      allow create: if request.auth.token.role == 'parent';
      allow read: if request.auth != null;
      allow update, delete: if request.auth.token.role == 'admin';
    }
  }
}
```

---

## 7. Development Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1: Foundation** | Week 1–2 | React + Firebase setup, auth, basic UI layouts, Firestore structure |
| **Phase 2: Core Features** | Week 3–5 | Driver verification, school/van search, booking system, OpenStreetMap |
| **Phase 3: Real-Time** | Week 6–7 | Location tracking, geo-fence alerts, FCM, QR generation/scanning |
| **Phase 4: Reviews & Advanced** | Week 8–9 | Reviews/ratings, attendance history, emergency alerts, admin enhancements |
| **Phase 5: Testing & Deployment** | Week 10 | E2E testing, mobile responsiveness, Firebase Hosting, optimization |

---

## 8. Best Practices & Guidelines

| Guideline | Description |
|-----------|-------------|
| **Mobile-First Design** | 80% of users access via mobile |
| **Offline Support** | Use Firebase offline persistence |
| **Performance** | Lazy load components, optimize images |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Error Handling** | Graceful degradation for location/camera permissions |
| **Privacy** | Display only first names of children publicly |
| **Testing** | Unit tests for Haversine, integration tests for booking flow |
| **Documentation** | Code comments, README with setup instructions |

---

## 9. Key Calculations

### 9.1 Haversine Distance Formula

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

### 9.2 Performance Score

```javascript
performanceScore = (
  (averageRating / 5) * 0.4 +
  (attendanceAccuracy / 100) * 0.3 +
  (punctualityScore / 100) * 0.2 +
  (tripCompletionRate / 100) * 0.1
) * 100
```

### 9.3 Total Contract Value

```javascript
totalValue = monthlyPrice × contractMonths
```

### 9.4 Vacancy Calculation

```javascript
currentVacancy = capacity - enrolledChildren.length
```

---

## 10. Deliverables

- [ ] Fully functional React web application
- [ ] Firebase backend configuration
- [ ] Three role-based dashboards (Parent, Driver, Admin)
- [ ] Real-time tracking with geo-fence alerts
- [ ] QR-based attendance system
- [ ] Reviews and ratings functionality
- [ ] Emergency alert system
- [ ] Responsive UI for mobile and desktop
- [ ] Deployment on Firebase Hosting
- [ ] User documentation and setup guide

---

## 11. Important Notes

| Topic | Requirement |
|-------|-------------|
| **Payment System** | Display UI only — no actual payment processing |
| **Privacy** | Never display full names or addresses publicly |
| **Aadhaar** | Handle with extreme care; encrypt before storage |
| **Real-Time** | Use Firestore real-time listeners, not polling |
| **Notifications** | Implement FCM for web and mobile |
| **Map** | OpenStreetMap is free; ensure proper attribution |

---

*Document generated from Hop-In project specification. Begin development with Phase 1: Foundation.*
