# FlipOne eCommerce Platform (v1)

> eCommerce platform built with the MERN stack: Express 5 + MongoDB (Mongoose 9) API, React 19 + Vite 8 frontend.

This project is part of my [MERN Stack From Scratch | eCommerce Platform](https://courses.chaicode.com/learn/Web-Dev-Cohort/Web-Dev-Cohort-Live) course.

## Features

- Full featured shopping cart with live stock checks
- Product search, category and price filters, pagination
- User profile with orders, liked products, profile picture
- Seller portal: products with up to 5 images, per-item order status (pending → shipped → delivered)
- Admin: user and seller management, categories, analytics (revenue, sales per seller)
- Checkout (shipping address, COD), order cancellation while nothing has shipped

## Requirements

- **Node.js 26** (see `.nvmrc` in each folder; `nvm use`)
- A MongoDB database (Atlas or local)

## Setup

### Backend (`FLIPONE-BACKEND`)

```bash
cd FLIPONE-BACKEND
cp .env.example .env      # then fill MONGO_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:5000, restarts on file changes
```

Env vars are loaded by Node itself (`--env-file-if-exists=.env`); there is no `dotenv` package.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Long random string for signing tokens |
| `PORT` | no | Default `5000` |
| `NODE_ENV` | no | `development` / `production` |
| `JWT_EXPIRE` | no | Token lifetime, default `1d` |
| `BASE_URL` | no | Public API URL, used for profile picture links |
| `CORS_ORIGIN` | prod | Comma-separated allowed frontend origins. Unset in development = any `http://localhost:<port>` |
| `TRUST_PROXY` | no | Set to `1` behind a reverse proxy |
| `LOG_LEVEL` | no | `error`, `warn`, `info`, `http` or `debug` |
| `MAIL_TRANSPORT` | prod | `gmail` (App Password), `gmail-oauth2` or `smtp`. Unset in development = sign-up codes are printed in the backend terminal and the email is saved to `logs/mail/latest.html` |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | with `gmail` | The Gmail account that sends, and a 16-letter App Password for it |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | with `gmail-oauth2` | OAuth client from Google Cloud Console (see `.env.example`) |
| `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS` | no | Sender shown in the inbox, default `FlipOne <GMAIL_USER>` |

New shopper accounts confirm their email with a 6-digit code (10 minutes, 5 tries, a new code after 60 s). Accounts created before this, including the demo shoppers below, count as confirmed.

The server refuses to start if `MONGO_URI` or `JWT_SECRET` is missing, or if MongoDB is unreachable.

**First admin.** Admin signup is admin-only, so create the first admin from the command line:

```bash
ADMIN_NAME="Your Name" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='Str0ng@Pass' npm run create-admin
```

**Demo data.** `npm run seed:demo` fills the database with 7 categories, 9 sellers, ~58 products (photos from the frontend's `public/`), 11 shoppers, 2 admins, liked products and ~30 days of orders in every status. It is safe to re-run: existing rows are kept, and orders are only generated when fewer than 10 exist.

| Role | Login | Password |
| --- | --- | --- |
| Admin | `admin@flipone.dev`, `ops@flipone.dev` | `FlipOne@Admin2026` |
| Seller | `seller@flipone.dev` (Acme Store), `kala@`, `rang@`, `urbansole@`, `mira@`, `chronos@`, `lumen@`, `tara@flipone.dev` | `FlipOne@Seller2026` |
| Shopper | `riya@`, `aarav@`, `priya@`, `kabir@`, `ananya@`, `rohan@`, `sneha@`, `arjun@`, `meera@`, `ishaan@flipone.dev` | `FlipOne@User2026` |

`oldmill@flipone.dev` (seller) and `vikram@flipone.dev` (shopper) are deactivated on purpose. These are demo credentials: change them before deploying anywhere public.

Other scripts: `npm start` (production), `npm run lint`, `npm test`.

### Frontend (`FLIPONE-FRONTEND`)

```bash
cd FLIPONE-FRONTEND
cp .env.example .env      # VITE_BASE_URL=http://localhost:5000
npm install
npm run dev               # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm test`.

Run both at once in two terminals.

## Security notes

- Passwords are bcrypt-hashed and never returned by the API.
- Tokens expire (`JWT_EXPIRE`) and only HS256 is accepted.
- Login and signup are rate limited (20 tries per 15 minutes per IP); the whole API has a 300 requests/minute ceiling.
- Uploads accept JPEG/PNG/WEBP up to 5 MB; the file extension comes from the checked type, not the client's filename.
- Request bodies are validated with Joi; unknown fields are dropped.
