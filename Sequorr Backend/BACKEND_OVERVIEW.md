# Sequorr Backend — Technical Overview

This document provides a detailed breakdown of the Sequorr Backend architecture, file functions, and core logic.

---

## 🏗 System Architecture

The backend is built with **Node.js** and **Express**, using **MongoDB** (via Mongoose) as the primary database. It follows a modular structure to separate concerns between routing, business logic (controllers), data access (models), and external integrations (services).

### Project Structure
```text
Sequorr Backend/
├── src/
│   ├── config/         # System configurations (DB, API keys, etc.)
│   ├── controllers/    # Request handlers and business logic
│   ├── middleware/     # Auth, validation, and rate limiting
│   ├── models/         # Mongoose schemas (Blog, Tag, Waitlist, Contact)
│   ├── routes/         # API endpoint definitions
│   ├── services/       # External API integrations (RunSignUp, Nominatim)
│   ├── utils/          # Helper functions (normalization, fetch-with-timeout)
│   └── index.js        # Server entry point
├── seed.js             # Data seeding script
└── .env                # Environment variables
```

---

## 🚦 Core Logic & Services

### 1. Race Discovery (Findrr)
The Findrr engine proxies the **RunSignUp API**. It uses a sophisticated "Lazy Geocoding" and "Over-fetching" strategy to provide a fast, responsive map experience.

- **`runsignupService.js`**: Handles authenticated requests to RunSignUp. It normalizes variety in upstream data formats into a clean, consistent internal structure.
- **`raceFilterService.js`**: Since RunSignUp doesn't support certain advanced filters (like `registration_open`), this service applies client-side filtering and pagination after fetching raw results.
- **`geocodeService.js`**: Proxies the **Nominatim (OpenStreetMap)** API to convert race addresses into geographical coordinates. It includes server-side caching to respect rate limits.

### 2. Blog CMS
A full-featured content management system with support for dynamic tags and multimedia sections.

- **`Blog.js` (Model)**: Uses a flexible Mongoose schema with embedded `sections` and dynamic `tags`. It features pre-validate hooks to auto-generate SEO-friendly slugs and estimate average read times.
- **`tags.js` (Routes)**: Manages dynamic taxonomy. Tags are stored in a dedicated `Tag` collection, allowing the blog editor to fetch and create them on-the-fly without hardcoded enums.
- **`validateBlog.js`**: Strict Joi-based validation to ensure content integrity before it hits the database.

### 3. Admin & Authentication
- **`admin.js` (Routes)**: Handles the login process. It validates the client-side API key against the server's `.env` and issues a short-lived **JWT (JSON Web Token)**.
- **`adminAuth.js` (Middleware)**: Intercepts requests to protected routes (`/admin`, `/races`) and verifies the JWT signature. This ensures that only authorized administrators can modify content or exceed public rate limits.

### 4. Waitlist System
Handles new signups and automated email notifications.

- **`emailService.js`**: Uses **Nodemailer** to send high-performance, asynchronous welcome emails to new waitlist entries. It is designed to be "fire-and-forget" so that email delivery issues never block the user's signup request.

---

## 🔒 Middleware & Security

- **`adminAuth.js`**: Validates the `x-api-key` header for all protected routes.
- **`rateLimiter.js`**: Protects the server from abuse using `express-rate-limit`. Public endpoints (Waitlist, Findrr) have tiered limits to ensure stability.
- **`cors.js`**: Manages cross-origin resource sharing, allowing only trusted frontend domains.

---

## 📁 File-by-File Details

| File | Purpose |
|:---|:---|
| `index.js` | Initializes Express, connects to MongoDB, and registers top-level middleware/routes. |
| `raceController.js` | Coordinates the complex fetching, filtering, and lazy-geocoding flow for Findrr. |
| `races.js` (Routes) | Defines endpoints for race search, single race details, and filter options. |
| `blog.js` (Routes) | Handles CRUD for both public blog views and private admin management. |
| `waitlist.js` (Routes) | Manages public signups and admin data export/deletion. |
| `normalizeRace.js` | A utility that transforms the complex RunSignUp JSON response into a flat, UI-friendly object. |

---

## 🚀 Deployment & Environment

The server relies on several key environment variables defined in `.env`:
- `MONGODB_URI`: Connects to your local or cloud database.
- `RUNSIGNUP_API_KEY / SECRET`: Required for race discovery.
- `SMTP_HOST / USER / PASS`: Required for waitlist welcome emails.
- `ADMIN_API_KEY`: The key required for all `/admin` routes.
