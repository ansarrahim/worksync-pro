# WorkSync Pro Deployment

Recommended setup:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render PostgreSQL

## Backend Environment Variables

Set these in Render:

```text
NODE_ENV=production
DATABASE_URL=<Render PostgreSQL internal database URL>
JWT_SECRET=<long random secret>
CLIENT_URL=<your Vercel frontend URL>
```

Render should run:

```bash
cd backend && npm install && npm start
```

## Frontend Environment Variables

Set this in Vercel:

```text
REACT_APP_API_URL=<your Render backend URL>
```

Vercel settings:

```text
Root directory: frontend
Build command: npm run build
Output directory: build
```

## Data Storage

Production data is stored in PostgreSQL, not on your laptop. The backend creates the required tables on first startup and seeds the three default users:

- SHAHKAR
- ABRAR
- ANSAR

Default password:

```text
password123
```

Change these passwords after deployment.
