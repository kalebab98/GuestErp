# GuestCare - API Documentation

## 1. Authentication & Security Headers

### Guest Access
- Parameter: `token` (32-byte cryptographic hex string in QR URL).
- Edge function validates the SHA-256 hash against `guestcare.portal_sessions`.
- Upon successful validation, the client obtains a session context (reservation reference, apartment reference, guest name, check-in, check-out).
- In REST/Edge calls: `Authorization: Bearer <portal_session_token>`.

### Staff Access
- Standard Supabase Auth JWT: `Authorization: Bearer <supabase_access_token>`.
- Scoped with custom claims or role mapping (`admin`, `manager`, `reception`, `maintenance`, `housekeeping`).

---

## 2. Guest Portal Endpoints / Edge Functions

### 2.1 Validate QR Token
- **POST** `/functions/v1/validate-portal-token`
- **Request Body**:
  ```json
  {
    "token": "a8f5b49320e..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "valid": true,
    "session": {
      "sessionId": "46908e26-...",
      "reservationRef": "RES-89211",
      "apartmentRef": "Apt 402 - Ocean View",
      "guestName": "Sarah Jenkins",
      "checkInDate": "2026-11-15T15:00:00Z",
      "checkOutDate": "2026-11-20T11:00:00Z",
      "expiresAt": "2026-11-20T14:00:00Z"
    }
  }
  ```

### 2.2 Submit Request
- **POST** `/functions/v1/guest-submit-request`
- **Headers**: `X-Portal-Token: <token>`
- **Request Body**:
  ```json
  {
    "categoryId": "2e06...",
    "title": "Air Conditioner not cooling",
    "description": "The AC unit in the bedroom makes a loud humming sound and blows room temperature air.",
    "attachments": [
      {
        "fileName": "ac_unit.jpg",
        "filePath": "attachments/res-89211/ac_unit.jpg",
        "fileSize": 184022,
        "mimeType": "image/jpeg"
      }
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "e6cb81b...",
    "ticketNumber": "GC-20261117-0042",
    "status": "new",
    "priority": "medium",
    "createdAt": "2026-11-17T16:15:00Z"
  }
  ```

### 2.3 List My Requests
- **GET** `/functions/v1/guest-list-requests`
- **Headers**: `X-Portal-Token: <token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "e6cb81b...",
      "ticketNumber": "GC-20261117-0042",
      "category": "Maintenance",
      "title": "Air Conditioner not cooling",
      "status": "in_progress",
      "priority": "medium",
      "createdAt": "2026-11-17T16:15:00Z",
      "timeline": [
        { "status": "new", "time": "2026-11-17T16:15:00Z" },
        { "status": "acknowledged", "time": "2026-11-17T16:20:00Z" },
        { "status": "in_progress", "time": "2026-11-17T16:35:00Z" }
      ]
    }
  ]
  ```

### 2.4 Confirm or Dispute Resolution
- **POST** `/functions/v1/guest-confirm-resolution`
- **Headers**: `X-Portal-Token: <token>`
- **Request Body**:
  ```json
  {
    "requestId": "e6cb81b...",
    "satisfied": true,
    "feedbackNotes": "Fixed fast, thank you!"
  }
  ```
- *Alternative dispute (re-open)*:
  ```json
  {
    "requestId": "e6cb81b...",
    "satisfied": false,
    "reopenReason": "Technician came, but it started leaking water 10 minutes later."
  }
  ```

### 2.5 Submit Private Feedback
- **POST** `/functions/v1/guest-submit-feedback`
- **Headers**: `X-Portal-Token: <token>`
- **Request Body**:
  ```json
  {
    "overallRating": 4,
    "cleanlinessRating": 5,
    "staffRating": 5,
    "comfortRating": 3,
    "comments": "Great service, bed is a bit too firm.",
    "isAnonymous": false
  }
  ```

---

## 3. Staff Dashboard Endpoints / RPC Functions

### 3.1 Assign Request
- **POST** `/rest/v1/rpc/assign_request`
- **Headers**: `Authorization: Bearer <staff_jwt>`
- **Request Body**:
  ```json
  {
    "p_request_id": "e6cb81b...",
    "p_department": "maintenance",
    "p_staff_id": "75c3...",
    "p_notes": "Assigned to Carlos for quick AC compressor check"
  }
  ```

### 3.2 Update Status & Resolution
- **POST** `/rest/v1/rpc/update_request_status`
- **Headers**: `Authorization: Bearer <staff_jwt>`
- **Request Body**:
  ```json
  {
    "p_request_id": "e6cb81b...",
    "p_new_status": "resolved",
    "p_resolution_notes": "Replaced the capacitor on unit #2. Tested temperature at 21C.",
    "p_reason": "Maintenance work completed"
  }
  ```

### 3.3 Recalculate Guest Health
- **POST** `/rest/v1/rpc/calculate_guest_health`
- **Request Body**:
  ```json
  {
    "p_reservation_ref": "RES-89211"
  }
  ```
- **Response**:
  ```json
  {
    "status": "improving",
    "score": 75,
    "reasons": [
      "1 resolved maintenance ticket",
      "Guest confirmed satisfaction",
      "No open urgent tickets"
    ]
  }
  ```

