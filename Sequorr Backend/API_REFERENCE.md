# Sequorr API Reference

**Base URL:** `http://localhost:5000`

---

## Uniform Response Format

Every endpoint returns JSON with a top-level `success` boolean:

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "Error description" }

// Validation Error
{ "success": false, "errors": ["field error 1", "field error 2"] }
```

| Status | Meaning                          |
|--------|----------------------------------|
| `200`  | OK                               |
| `201`  | Created                          |
| `400`  | Validation error                 |
| `401`  | Missing / invalid API key        |
| `404`  | Resource not found               |
| `409`  | Duplicate (email, slug, etc.)    |
| `429`  | Rate limit exceeded              |
| `500`  | Server error                     |
| `502`  | Upstream API error (RunSignUp)   |
| `504`  | Upstream API timeout (RunSignUp) |

---

## Authentication

Admin routes require an API key sent via request header:

```
x-api-key: your_admin_api_key_here
```

Set the key in your `.env` file as `ADMIN_API_KEY`.

---

## Health Check

### `GET /api/health`

### `GET /health`

> Both endpoints return the same response.

**Auth:** None

**Response** `200`
```json
{
  "success": true,
  "message": "Sequorr API is running 🚀"
}
```

---

## Waitlist

### `POST /api/waitlist` — Submit a signup

**Auth:** None  
**Rate Limit:** 30 requests / 15 minutes per IP  
**Content-Type:** `application/json`

> On successful signup, a **welcome email** is automatically sent to the user via Nodemailer (if SMTP is configured in `.env`). The email is non-blocking — the API response is returned immediately regardless of email delivery status.

**Request Body**
```json
{
  "email": "jane@example.com",
  "description": "Gym enthusiast looking to get back in shape",
  "usualMoveTime": "Morning 6-8 AM"
}
```

| Field            | Type   | Required | Max Length  |
|------------------|--------|----------|------------|
| `email`          | string | ✅       | valid email |
| `description`    | string | ✅       | 200 chars   |
| `usualMoveTime`  | string | ✅       | 200 chars   |

**Response** `201`
```json
{
  "success": true,
  "message": "You have been added to the waitlist! 🎉",
  "data": {
    "id": "65f...",
    "email": "jane@example.com"
  }
}
```

**Errors**

| Status | Response |
|--------|----------|
| `400`  | `{ "success": false, "errors": ["Email is required", "..."] }` |
| `409`  | `{ "success": false, "message": "This email is already on the waitlist" }` |
| `429`  | `{ "success": false, "message": "Too many requests from this IP..." }` |

---

### `GET /api/waitlist/admin` — List all signups

**Auth:** `x-api-key` header required

**Query Params**

| Param   | Default | Description              |
|---------|---------|--------------------------|
| `page`  | 1       | Page number              |
| `limit` | 50      | Items per page (max 200) |

**Response** `200`
```json
{
  "success": true,
  "total": 42,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f...",
      "email": "jane@example.com",
      "description": "Gym enthusiast",
      "usualMoveTime": "Morning 6-8 AM",
      "createdAt": "2026-02-27T12:00:00.000Z",
      "updatedAt": "2026-02-27T12:00:00.000Z"
    }
  ]
}
```

**Errors**

| Status | Response |
|--------|----------|
| `401`  | `{ "success": false, "message": "Unauthorized — invalid or missing API key" }` |

---

### `DELETE /api/waitlist/admin/:id` — Delete a waitlist entry

**Auth:** `x-api-key` header required

**URL Params**

| Param | Type   | Description                 |
|-------|--------|-----------------------------|
| `id`  | string | MongoDB `_id` of the entry  |

**Response** `200`
```json
{
  "success": true,
  "message": "Waitlist entry deleted successfully"
}
```

**Errors**

| Status | Response |
|--------|----------|
| `401`  | `{ "success": false, "message": "Unauthorized — invalid or missing API key" }` |
| `404`  | `{ "success": false, "message": "Waitlist entry not found" }` |

---

### `GET /api/waitlist/admin/stats` — Aggregated stats

**Auth:** `x-api-key` header required

**Response** `200`
```json
{
  "success": true,
  "total": 42,
  "byDescription": [
    { "_id": "Gym enthusiast", "count": 15 },
    { "_id": "Runner", "count": 10 }
  ],
  "byMoveTime": [
    { "_id": "Morning 6-8 AM", "count": 20 },
    { "_id": "Evening 5-7 PM", "count": 12 }
  ]
}
```

---

---
 
 ## Contact
 
 ### `POST /api/contact` — Submit a contact form
 
 **Auth:** None  
 **Rate Limit:** 10 requests / 1 hour per IP  
 **Content-Type:** `application/json`
 
 > When a message is submitted, the Sequorr team is automatically notified via email (if SMTP is configured in `.env`).
 
 **Request Body**
 ```json
 {
   "name": "Jane Doe",
   "email": "jane@example.com",
   "reason": "Partnership Opportunity",
   "message": "I would love to discuss a potential partnership with Sequorr..."
 }
 ```
 
 | Field     | Type   | Required | Notes                                                                 |
 |-----------|--------|----------|-----------------------------------------------------------------------|
 | `name`    | string | ✅       | Sender's name                                                         |
 | `email`   | string | ✅       | Valid email address                                                   |
 | `reason`  | string | ✅       | Must be one of the allowed reasons (see below)                        |
 | `message` | string | ✅       | Max 2000 characters                                                   |
 
 **Allowed Reasons:**
 - `General Inquiry`
 - `Technical Support / Bug Report`
 - `Partnership Opportunity`
 - `Feedback & Suggestions`
 - `Media Inquiry`
 
 **Response** `201`
 ```json
 {
   "success": true,
   "message": "Your message has been sent successfully! We will get back to you soon."
 }
 ```
 
 **Errors**
 
 | Status | Response |
 |--------|----------|
 | `400`  | `{ "success": false, "errors": ["Name is required", "..."] }` |
 | `429`  | `{ "success": false, "message": "Too many messages sent. Please try again later." }` |
 
 ---
 
 ### `GET /api/contact/admin` — List all contact messages
 
 **Auth:** `x-api-key` header required
 
 **Query Params**
 
 | Param   | Default | Description              |
 |---------|---------|--------------------------|
 | `page`  | 1       | Page number              |
 | `limit` | 20      | Items per page (max 100) |
 
 **Response** `200`
 ```json
 {
   "success": true,
   "total": 12,
   "page": 1,
   "totalPages": 1,
   "data": [
     {
       "_id": "65f...",
       "name": "Jane Doe",
       "email": "jane@example.com",
       "reason": "Partnership Opportunity",
       "message": "...",
       "status": "new",
       "createdAt": "2026-03-15T10:00:00.000Z",
       "updatedAt": "2026-03-15T10:00:00.000Z"
     }
   ]
 }
 ```
 
 ---
 
 ### `PATCH /api/contact/admin/:id` — Update message status
 
 **Auth:** `x-api-key` header required
 
 **Request Body**
 ```json
 {
   "status": "read"
 }
 ```
 
 | Field    | Type   | Required | Values                        |
 |----------|--------|----------|-------------------------------|
 | `status` | string | ✅       | `new`, `read`, `responded`    |
 
 **Response** `200`
 ```json
 {
   "success": true,
   "message": "Status updated successfully",
   "data": { ... }
 }
 ```
 
 ---
 
 ### `DELETE /api/contact/admin/:id` — Delete a message
 
 **Auth:** `x-api-key` header required
 
 **Response** `200`
 ```json
 {
   "success": true,
   "message": "Message deleted successfully"
 }
 ```
 
 ---
 
 ---

## Contact

### `POST /api/contact` — Submit a contact form

**Auth:** None  
**Rate Limit:** 10 requests / 1 hour per IP  
**Content-Type:** `application/json`

> When a message is submitted, the Sequorr team is automatically notified via email (if SMTP is configured in `.env`).

**Request Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "reason": "Partnership Opportunity",
  "message": "I would love to discuss a potential partnership with Sequorr..."
}
```

| Field     | Type   | Required | Notes                                                                 |
|-----------|--------|----------|-----------------------------------------------------------------------|
| `name`    | string | ✅       | Sender's name                                                         |
| `email`   | string | ✅       | Valid email address                                                   |
| `reason`  | string | ✅       | Must be one of the allowed reasons (see below)                        |
| `message` | string | ✅       | Max 2000 characters                                                   |

**Allowed Reasons:**
- `General Inquiry`
- `Technical Support / Bug Report`
- `Partnership Opportunity`
- `Feedback & Suggestions`
- `Media Inquiry`

**Response** `201`
```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon."
}
```

**Errors**

| Status | Response |
|--------|----------|
| `400`  | `{ "success": false, "errors": ["Name is required", "..."] }` |
| `429`  | `{ "success": false, "message": "Too many messages sent. Please try again later." }` |

---

### `GET /api/contact/admin` — List all contact messages

**Auth:** `x-api-key` header required

**Query Params**

| Param   | Default | Description              |
|---------|---------|--------------------------|
| `page`  | 1       | Page number              |
| `limit` | 20      | Items per page (max 100) |

**Response** `200`
```json
{
  "success": true,
  "total": 12,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "reason": "Partnership Opportunity",
      "message": "...",
      "status": "new",
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-03-15T10:00:00.000Z"
    }
  ]
}
```

---

### `PATCH /api/contact/admin/:id` — Update message status

**Auth:** `x-api-key` header required

**Request Body**
```json
{
  "status": "read"
}
```

| Field    | Type   | Required | Values                        |
|----------|--------|----------|-------------------------------|
| `status` | string | ✅       | `new`, `read`, `responded`    |

**Response** `200`
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": { ... }
}
```

---

### `GET /api/contact/admin/stats` — Get contact statistics

**Auth:** `x-api-key` header required

**Response** `200`
```json
{
  "success": true,
  "data": {
    "total": 42,
    "unread": 5,
    "byStatus": [
      { "_id": "new", "count": 5 },
      { "_id": "read", "count": 15 },
      { "_id": "responded", "count": 22 }
    ],
    "byReason": [
      { "_id": "Technical Support", "count": 20 },
      { "_id": "General Inquiry", "count": 12 }
      // ...
    ]
  }
}
```

---

### `DELETE /api/contact/admin/:id` — Delete a message

**Auth:** `x-api-key` header required

**Response** `200`
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## Blog

### `GET /api/blog` — List published blogs (public)

**Auth:** None

**Query Params**

| Param    | Default  | Example                 | Description                                |
|----------|----------|-------------------------|--------------------------------------------|
| `page`   | 1        | `?page=2`               | Page number                                |
| `limit`  | 10       | `?limit=5`              | Items per page (max 50)                    |
| `tags`   | —        | `?tags=cardio,nutrition` | Comma-separated tag filter (match any)    |
| `sort`   | `latest` | `?sort=most-read`       | `latest` / `oldest` / `most-read`          |
| `search` | —        | `?search=fitness`       | Case-insensitive title search              |

**Response** `200`
```json
{
  "success": true,
  "total": 5,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f...",
      "title": "5 Daily Habits That Transform Your Fitness",
      "slug": "5-daily-habits-that-transform-your-fitness-m5gf1k",
      "tags": ["daily-habit", "motivation"],
      "averageReadTime": 3,
      "readCount": 128,
      "createdAt": "2026-02-27T12:00:00.000Z"
    }
  ]
}
```

> **Note:** Only blogs with `published: true` are returned via this endpoint.

---

### `GET /api/blog/tags` — Available tags

**Auth:** None

**Response** `200`
```json
{
  "success": true,
  "tags": [
    "daily-habit", "real-life-fitness", "weightlifting", "cardio",
    "nutrition", "mental-health", "flexibility", "bodyweight",
    "recovery", "motivation"
  ]
}
```

---

### `GET /api/blog/admin` — List all blogs including drafts (admin)

**Auth:** `x-api-key` header required

**Query Params**

| Param       | Default  | Example               | Description                          |
|-------------|----------|-----------------------|--------------------------------------|
| `page`      | 1        | `?page=2`             | Page number                          |
| `limit`     | 20       | `?limit=10`           | Items per page (max 100)             |
| `published` | —        | `?published=false`    | Filter by `true` or `false`          |
| `tags`      | —        | `?tags=cardio`        | Comma-separated tag filter           |
| `sort`      | `latest` | `?sort=oldest`        | `latest` / `oldest` / `most-read`    |
| `search`    | —        | `?search=habits`      | Case-insensitive title search        |

**Response** `200`
```json
{
  "success": true,
  "total": 8,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f...",
      "title": "Draft: Upcoming Nutrition Guide",
      "slug": "draft-upcoming-nutrition-guide-x9kf2",
      "tags": ["nutrition"],
      "averageReadTime": 5,
      "readCount": 0,
      "published": false,
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:30:00.000Z"
    }
  ]
}
```

> **Note:** Unlike the public listing, this includes both **published and unpublished** blogs, and returns the `published` and `updatedAt` fields.

---

### `GET /api/blog/:slug` — Single blog by slug (public)

**Auth:** None

> Automatically increments `readCount` each time this endpoint is called.

**URL Params**

| Param  | Type   | Description         |
|--------|--------|---------------------|
| `slug` | string | Blog slug from list |

**Example:** `GET /api/blog/5-daily-habits-that-transform-your-fitness-m5gf1k`

**Response** `200`
```json
{
  "success": true,
  "data": {
    "_id": "65f...",
    "title": "5 Daily Habits That Transform Your Fitness",
    "slug": "5-daily-habits-that-transform-your-fitness-m5gf1k",
    "sections": [
      {
        "subHeading": "Start Your Morning Right",
        "content": "Waking up early and doing a 10-minute stretch..."
      },
      {
        "subHeading": "Hydration Is Key",
        "content": "Drinking at least 2 liters of water daily..."
      }
    ],
    "averageReadTime": 3,
    "tags": ["daily-habit", "motivation"],
    "readCount": 129,
    "published": true,
    "createdAt": "2026-02-27T12:00:00.000Z",
    "updatedAt": "2026-02-27T12:00:00.000Z"
  }
}
```

**Errors**

| Status | Response |
|--------|----------|
| `404`  | `{ "success": false, "message": "Blog not found" }` |

---

### `POST /api/blog` — Create a blog post (admin)

**Auth:** `x-api-key` header required  
**Content-Type:** `application/json`

**Request Body**
```json
{
  "title": "5 Daily Habits That Transform Your Fitness",
  "sections": [
    {
      "subHeading": "Start Your Morning Right",
      "content": "Waking up early and doing a 10-minute stretch routine can set the tone for your entire day."
    },
    {
      "subHeading": "Hydration Is Key",
      "content": "Drinking at least 2 liters of water daily improves performance and recovery."
    }
  ],
  "tags": ["daily-habit", "real-life-fitness", "motivation"],
  "published": true
}
```

| Field       | Type     | Required | Notes                                      |
|-------------|----------|----------|---------------------------------------------|
| `title`     | string   | ✅       | Max 300 chars. HTML tags are stripped.       |
| `sections`  | array    | ✅       | Min 1 section. Each has `subHeading` + `content`. HTML tags are stripped. |
| `tags`      | string[] | ❌       | Must be from the allowed tags list          |
| `published` | boolean  | ❌       | Defaults to `true`                          |

> `slug` and `averageReadTime` are **auto-generated** from the title and content.

**Response** `201`
```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": { ... }
}
```

**Errors**

| Status | Response |
|--------|----------|
| `400`  | `{ "success": false, "errors": ["Blog title is required", "..."] }` |
| `401`  | `{ "success": false, "message": "Unauthorized..." }` |
| `409`  | `{ "success": false, "message": "A blog with a similar title already exists" }` |

---

### `PUT /api/blog/:id` — Update a blog post (admin)

**Auth:** `x-api-key` header required  
**Content-Type:** `application/json`

**URL Params**

| Param | Type   | Description            |
|-------|--------|------------------------|
| `id`  | string | MongoDB `_id` of blog  |

**Request Body** — Same structure as POST. All fields are re-validated.

**Response** `200`
```json
{
  "success": true,
  "message": "Blog updated successfully",
  "data": { ... }
}
```

**Errors**

| Status | Response |
|--------|----------|
| `400`  | `{ "success": false, "errors": ["..."] }` |
| `401`  | `{ "success": false, "message": "Unauthorized..." }` |
| `404`  | `{ "success": false, "message": "Blog not found" }` |

---

### `DELETE /api/blog/:id` — Delete a blog post (admin)

**Auth:** `x-api-key` header required

**URL Params**

| Param | Type   | Description            |
|-------|--------|------------------------|
| `id`  | string | MongoDB `_id` of blog  |

**Response** `200`
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

**Errors**

| Status | Response |
|--------|----------|
| `401`  | `{ "success": false, "message": "Unauthorized..." }` |
| `404`  | `{ "success": false, "message": "Blog not found" }` |

---

## Races (Findr — RunSignUp Proxy)

> These endpoints proxy the RunSignUp REST API, keeping credentials server-side.  
> **Rate Limit:** 100 requests / 15 minutes per IP.  
> **Caching:** Race lists cached for 3 minutes, single race for 5 minutes.

### `GET /api/races` — Search & list races

**Auth:** None

**Query Params**

| Param                | Default | Example                  | Description                                      |
|----------------------|---------|--------------------------|--------------------------------------------------|
| **Pagination**       |         |                          |                                                  |
| `page`               | 1       | `?page=2`                | Page number                                      |
| `results_per_page`   | 12      | `?results_per_page=20`   | Results per page (max 50)                        |
| **Location**         |         |                          | *Sent to RunSignUp for server-side filtering*    |
| `city`               | —       | `?city=Boston`           | Filter by city                                   |
| `state`              | —       | `?state=MA`              | Filter by state code (max 3 chars)               |
| `zipcode`            | —       | `?zipcode=02101`         | Filter by ZIP code (use with `radius`)           |
| `radius`             | 25      | `?radius=50`             | Search radius in miles from zipcode (max 100)    |
| `country`            | `US`    | `?country=CA`            | Country code (max 3 chars)                       |
| `lat`                | —       | `?lat=42.36`             | Latitude (use with `lng`)                        |
| `lng`                | —       | `?lng=-71.06`            | Longitude (use with `lat`)                       |
| **Date**             |         |                          | *Sent to RunSignUp for server-side filtering*    |
| `start_date`         | `today` | `?start_date=2026-06-01` | Start date (`YYYY-MM-DD` or `today`)             |
| `end_date`           | —       | `?end_date=2026-12-31`   | End date (`YYYY-MM-DD`)                          |
| **Race Type & Distance** |     |                          | *Sent to RunSignUp for server-side filtering*    |
| `event_type`         | —       | `?event_type=running`    | Race type filter (sent to RunSignUp directly)    |
| `min_distance`       | —       | `?min_distance=3.1`      | Minimum race distance (in `distance_units`)      |
| `max_distance`       | —       | `?max_distance=26.2`     | Maximum race distance (in `distance_units`)      |
| `distance_units`     | `miles` | `?distance_units=km`     | `miles` or `km`                                  |
| **Search**           |         |                          | *Sent to RunSignUp as `name` param*              |
| `search`             | —       | `?search=boston marathon` | Search by race name (sent upstream for best results) |
| **Client-Side Filters** |      |                          | *Applied after fetching from RunSignUp*          |
| `registration_open`  | —       | `?registration_open=true`| Only races with open registration                |
| `has_virtual_option` | —       | `?has_virtual_option=true`| Only races with a virtual event option           |
| **Extra Filters**    |         |                          | *Sent to RunSignUp for server-side filtering*    |
| `only_races_with_results` | — | `?only_races_with_results=true` | Only races that have published results     |
| `include_event_days` | —       | `?include_event_days=true`| Include event day info (e.g., each race year)   |
| **Sorting**          |         |                          |                                                  |
| `sort`               | `date`  | `?sort=distance`         | Sort by: `date`, `name`, `distance`, `relevance` |
| `sort_dir`           | `ASC`   | `?sort_dir=DESC`         | `ASC` or `DESC`                                  |

> **Extra query params** (like `utm_source`) are silently ignored — they won't cause errors.
>
> **How filtering works:** Most filters (`event_type`, `distance`, `search`, `location`, `date`) are sent directly to the RunSignUp API for accurate, server-side filtering. Only `registration_open` and `has_virtual_option` are applied client-side after fetching, since RunSignUp doesn't support those natively.

**Response** `200`
```json
{
  "success": true,
  "races": [
    {
      "race_id": 12345,
      "name": "Boston Spring 10K",
      "description": "A scenic 10K through downtown Boston...",
      "url": "https://runsignup.com/Race/MA/Boston/...",
      "external_race_url": "",
      "next_date": "2026-06-15",
      "timezone": "US/Eastern",
      "address": {
        "street": "123 Main St",
        "city": "Boston",
        "state": "MA",
        "zipcode": "02101",
        "country_code": "US"
      },
      "logo_url": "https://...",
      "is_registration_open": true,
      "events": [
        {
          "event_id": 67890,
          "name": "10K Run",
          "event_type": "running",
          "distance": "10K",
          "distance_miles": 6.2,
          "start_time": "08:00:00",
          "end_time": null,
          "giveaway": "Finisher medal",
          "registration_periods": [...]
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "results_per_page": 12,
    "total_results": 47,
    "total_pages": 4
  },
  "filters_applied": {
    "state": "MA",
    "event_type": ["running"]
  }
}
```

**Errors**

| Status | Response |
|--------|----------|
| `400`  | `{ "success": false, "message": "page: Expected number, received nan; ..." }` |
| `429`  | `{ "success": false, "message": "Too many requests..." }` |
| `502`  | `{ "success": false, "message": "Upstream API error: 500 ..." }` |
| `504`  | `{ "success": false, "message": "Upstream API timed out after 12000ms" }` |

---

### `GET /api/race/:raceId` — Single race detail

**Auth:** None

**URL Params**

| Param    | Type   | Description                   |
|----------|--------|-------------------------------|
| `raceId` | string | Numeric race ID (digits only) |

**Example:** `GET /api/race/12345`

**Response** `200`
```json
{
  "success": true,
  "data": {
    "race_id": 12345,
    "name": "Boston Spring 10K",
    "description": "A scenic 10K through downtown Boston...",
    "url": "https://runsignup.com/Race/...",
    "external_race_url": "",
    "next_date": "2026-06-15",
    "timezone": "US/Eastern",
    "address": { "street": "...", "city": "Boston", "state": "MA", "zipcode": "02101", "country_code": "US" },
    "logo_url": "https://...",
    "is_registration_open": true,
    "events": [...]
  }
}
```

**Errors**

| Status | Response |
|--------|----------|
| `400`  | `{ "success": false, "message": "raceId: raceId must be a numeric string" }` |
| `502`  | `{ "success": false, "message": "Upstream API error: ..." }` |

---

### `GET /api/races/filters` — Available filter options

**Auth:** None

> Use this to populate frontend dropdowns and filter UIs.

**Response** `200`
```json
{
  "success": true,
  "event_types": ["running", "trail", "walking", "cycling", "triathlon", "obstacle", "virtual", "swimming"],
  "distance_presets": [
    { "label": "5K", "miles": 3.1 },
    { "label": "10K", "miles": 6.2 },
    { "label": "Half Marathon", "miles": 13.1 },
    { "label": "Marathon", "miles": 26.2 },
    { "label": "Ultra (50K+)", "miles": 31.1 }
  ],
  "sort_options": ["date", "name", "distance"],
  "max_radius": 100
}
```

---

## Postman / Frontend Setup

### Postman

1. Create an **Environment** with variables:
   - `base_url` = `http://localhost:5000`
   - `api_key` = your `ADMIN_API_KEY` value

2. For admin requests, add this header:
   - Key: `x-api-key`  →  Value: `{{api_key}}`

3. For POST/PUT requests, set:
   - Body → **raw** → **JSON**

### Frontend Integration

All responses include a `success` boolean you can check consistently:

```javascript
const res = await fetch('http://localhost:5000/api/blog');
const data = await res.json();

if (data.success) {
  // Handle data.data, data.races, etc.
} else {
  // Handle data.message or data.errors
}
```

**CORS:** The server accepts requests from origins listed in the `ALLOWED_ORIGINS` env var. Requests without an `Origin` header (mobile apps, curl) are always allowed.

**Rate Limits:**
- Waitlist endpoints: **30 requests / 15 min** per IP
- Contact endpoint: **10 requests / 1 hour** per IP
- Race endpoints: **100 requests / 15 min** per IP
