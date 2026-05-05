# WorkSync Pro Free Deployment

Recommended free setup:

- Database: Aiven PostgreSQL free tier
- Backend: Vercel project with root directory `backend`
- Frontend: Vercel project with root directory `frontend`

## 1. Backend on Vercel

Import the GitHub repo into Vercel and choose these settings:

```text
Project name: worksync-pro-backend
Root directory: backend
Framework preset: Other
Build command: leave empty
Output directory: leave empty
Install command: npm install
```

Environment variables:

```text
NODE_ENV=production
DATABASE_URL=<your Aiven PostgreSQL connection URL>
JWT_SECRET=<long random secret>
CLIENT_URL=*
```

After deployment, test:

```text
https://your-backend.vercel.app/api/health
```

## 2. Frontend on Vercel

Import the same GitHub repo again and choose:

```text
Project name: worksync-pro-frontend
Root directory: frontend
Framework preset: Create React App
Build command: npm run build
Output directory: build
Install command: npm install
```

Environment variable:

```text
REACT_APP_API_URL=https://your-backend.vercel.app
```

## 3. Lock CORS After Frontend Works

After Vercel gives you the frontend URL, update backend env:

```text
CLIENT_URL=https://your-frontend.vercel.app
```

Then redeploy the backend.

## Data Storage

All production data is stored in Aiven PostgreSQL. The backend creates tables automatically on first request and seeds:

- SHAHKAR
- ABRAR
- ANSAR

Default password:

```text
password123
```

Change these passwords after deployment.
