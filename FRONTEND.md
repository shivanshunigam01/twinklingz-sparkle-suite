# Twinklingz frontend (store + admin)

Vite + TanStack Router app:

- **Public shop** — `/`, `/shop`, `/checkout`, etc.
- **Admin** — `/admin/login`, `/admin/dashboard`, …

## Run locally

1. Start the API from the sibling backend project:

   ```bash
   cd ../twinklingz-backend
   npm run dev
   ```

2. Start this app:

   ```bash
   npm install
   npm run dev
   ```

3. `.env` must include:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

The API lives only in **`../twinklingz-backend`** (there is no `backend/` folder in this project).
