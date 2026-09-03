# Bon Mariage — Boutique Platform

A full-stack e-commerce & booking system for a bridal/evening-wear boutique:
a customer-facing storefront plus a password-protected admin dashboard for
the owner (Samer) to manage products, appointments, and analytics.

## Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Frontend:** Plain HTML5 / CSS3 / JavaScript (fetch API), no build step required

## Project Structure

```
bon-mariage-app/
├── config/
│   └── db.js                # MongoDB connection
├── middleware/
│   └── adminAuth.js         # Shared-secret admin protection
├── models/
│   ├── Product.js
│   ├── Appointment.js
│   └── Analytics.js
├── routes/
│   ├── products.js
│   ├── appointments.js
│   └── analytics.js
├── public/
│   ├── index.html           # Customer storefront
│   ├── admin.html           # Admin dashboard
│   ├── css/style.css
│   └── js/
│       ├── storefront.js
│       └── admin.js
├── seed.js                  # Sample product data
├── server.js                # App entry point
├── package.json
└── .env.example
```

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

- `MONGODB_URI` — your MongoDB Atlas connection string (or a local `mongodb://127.0.0.1:27017/bonmariage`)
- `ADMIN_KEY` — a secret string used to protect the admin dashboard's write operations. Change it to something long and random before going live.
- `PORT` — defaults to 5000

## 3. (Optional) Seed sample products

```bash
npm run seed
```

This clears and reinserts four sample dresses so the storefront and dashboard aren't empty on first run.

## 4. Run the server

```bash
npm start
```

For local development with auto-restart on file changes:

```bash
npm run dev
```

Then visit:

- **Storefront:** http://localhost:5000/
- **Admin dashboard:** http://localhost:5000/admin

On first visit to `/admin`, you'll be asked for the `ADMIN_KEY` you set in `.env`. It's then cached in the browser's `localStorage` and sent as the `x-admin-key` header on every admin API request.

## API Reference

### Products — `/api/products`

| Method | Route                     | Auth  | Description                          |
|--------|---------------------------|-------|---------------------------------------|
| GET    | `/`                       | Public | List products (`?category=`, `?status=`, `?search=`) |
| GET    | `/:id`                    | Public | Get one product |
| POST   | `/:id/like`               | Public | Increment a product's like counter |
| POST   | `/`                       | Admin | Create a product |
| PUT    | `/:id`                    | Admin | Update a product |
| PATCH  | `/:id/status`             | Admin | Quick inventory status toggle |
| DELETE | `/:id`                    | Admin | Delete a product |

### Appointments — `/api/appointments`

| Method | Route     | Auth  | Description |
|--------|-----------|-------|-------------|
| POST   | `/`       | Public | Submit a fitting request from the storefront |
| GET    | `/`       | Admin | List all appointments (`?status=`) |
| PUT    | `/:id`    | Admin | Update an appointment (e.g. status) |
| DELETE | `/:id`    | Admin | Delete an appointment |

### Analytics — `/api/analytics`

| Method | Route       | Auth  | Description |
|--------|-------------|-------|-------------|
| POST   | `/visit`    | Public | Log a storefront page visit |
| GET    | `/summary`  | Admin | Dashboard summary: visits, most-liked products, appointment/product breakdowns |

All admin routes require the header `x-admin-key: <your ADMIN_KEY>`.

## Deploying

This app is a standard Node/Express server and can be deployed as-is to
Render, Railway, Fly.io, or a VPS. Point `MONGODB_URI` at a MongoDB Atlas
cluster (free tier is enough to start) and set `ADMIN_KEY` and `PORT` as
environment variables on your host — don't commit your real `.env` file.

## Notes & Next Steps

- **Auth:** The admin dashboard uses a single shared secret key rather than
  individual user accounts. That's intentional for a single-owner boutique,
  but if more than one staff member will use the dashboard, swap
  `middleware/adminAuth.js` for real session/JWT-based login.
- **Image uploads:** Products currently take an image *URL* (paste a link
  from any image host). Wiring up direct file uploads (e.g. via `multer` +
  Cloudinary/S3) is a natural next step if Samer wants to upload photos
  straight from his phone.
- **WhatsApp number:** Set in `public/js/storefront.js` as `WHATSAPP_NUMBER`
  — update it to the boutique's real WhatsApp Business number.
