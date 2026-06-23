# Ithilien

> Named after the garden-province of Gondor — a fitting home for a plant-care app.

Ithilien is a houseplant care tracker. Add the plants you own, pull in real species data (light, humidity, watering, toxicity, and more) from the [Trefle](https://trefle.io/) botanical API, and keep on top of watering with a care calendar and reminders.

---

## Screenshots



**Landing Page**

<img width="900" alt="Landing" src="https://github.com/user-attachments/assets/85ddc0be-d6e1-4e1d-a9ab-9f31e88525d3" />


**My Garden**

<img width="900" alt="My Garden" src="https://github.com/user-attachments/assets/f46a9429-8fea-4f8f-9520-70e91de7c4ae" />


**Plant Profile**

<img width="900" alt="Plant Profile" src="https://github.com/user-attachments/assets/fb3f841d-c6b9-47c2-8035-c481380bc212" />

---

## Features

| Feature | Description |
|---------|-------------|
| **My Garden** | Add, view, and manage the plants you own, each with a nickname, photo, and watering schedule |
| **Species Data** | Look up plants against the [Trefle](https://trefle.io/) API and auto-fill care details — light, humidity, watering, growth rate, toxicity, edibility, and flower/foliage colors |
| **Plant Profiles** | A dedicated page per plant showing its species info, photo, and care history |
| **Care Calendar** | See watering and care events laid out on a calendar, timezone-aware per user |
| **Reminders** | Surface plants that are due (or overdue) for watering based on their schedule |
| **Care Logs** | Record care actions (e.g. watering) against a plant over time |
| **Photo Uploads** | Upload plant photos, processed with [sharp](https://sharp.pixelplumbing.com/) and stored on local disk or Azure Blob Storage |
| **Accounts** | Email/password auth via [Better Auth](https://www.better-auth.com/), so each user has their own garden |

---

## Architecture

Ithilien is an npm-workspaces monorepo with two packages:

- **`client/`** — a [React 19](https://react.dev/) single-page app built with [Vite](https://vite.dev/) and [React-Bootstrap](https://react-bootstrap.netlify.app/), routed with React Router.
- **`server/`** — an [Express 5](https://expressjs.com/) API backed by a [MySQL](https://www.mysql.com/) database via [Prisma](https://www.prisma.io/), with [Better Auth](https://www.better-auth.com/) for sessions.

In production the server also serves the client's built static files, so the whole app runs from a single process.

### Key design decisions

#### Caching species data on the plant

**Problem:** Care details for a plant come from the external Trefle API. Hitting Trefle on every page load is slow, rate-limited, and breaks if the third party is down.

**Solution:** When a plant is matched to a species, the relevant Trefle fields (light, humidity, watering, toxicity, flower/foliage colors, etc.) are copied onto the `Plant` record itself. The app reads from its own database, and Trefle is only touched during lookup.

#### Pluggable image storage

**Problem:** Local development shouldn't require a cloud account, but production needs durable, scalable image hosting.

**Solution:** Image storage sits behind an adapter (`IMAGE_ADAPTER`). Set it to `local` to write uploads to a folder on disk for development, or `cloud` to store them in Azure Blob Storage. The rest of the app is unaware of which backend is in use.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (with `npm` workspaces support)
- A [MySQL](https://www.mysql.com/) database (local or hosted)
- A free [Trefle API token](https://trefle.io/)

### Installation

```bash
# Clone the repo and move into it
git clone https://github.com/JoshuaHorsley/Ithilien.git
cd Ithilien

# Install dependencies for all workspaces
npm install

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Fill in your values (DATABASE_URL, TREFLE_API_TOKEN, AUTH_SECRET, etc.)

# Set up the database
npm run generate --workspace=server
npx prisma migrate dev --schema=server/prisma/schema.prisma
```

### Running locally

From the repo root:

```bash
npm run dev:server   # starts the Express API (default http://localhost:3003)
npm run dev:client   # starts the Vite dev server (default http://localhost:5173)
```

> The `client/` and `server/` folders also have their own scripts in their `package.json` files if you'd rather run them directly.

---

## License

Released under the ISC License.
