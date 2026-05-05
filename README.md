# WorkSync Pro - Team Dashboard

A professional web-based team collaboration dashboard for managing YouTube automation, trading updates, and team communications.

## Features

✅ **User Authentication** - Secure login for 3 team members
✅ **YouTube Automation Tracking** - Track videos created, scheduled, and weekly targets
✅ **Trading Management** - Monitor positions, P&L, and trading notes
✅ **Discussion Tabs** - Real-time communication for YouTube and Trading sections
✅ **Team Dashboard** - Manager view of all team updates
✅ **Professional UI** - Beautiful gradient design, fully responsive
✅ **Completely Free** - No subscriptions, self-hosted

## Team Members

- **SHAHKAR** (Japan) - Manager & Viewer
- **ABRAR** (Pakistan) - Trading Specialist  
- **ANSAR** (Pakistan) - YouTube Automation Specialist

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application Locally

### Step 1: Start the Backend Server

Open a terminal in the `backend` folder and run:

```bash
npm start
```

You should see:
```
🚀 WorkSync Pro Backend running on http://localhost:5000
Connected to SQLite database
```

### Step 2: Start the Frontend Application

Open a new terminal in the `frontend` folder and run:

```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

## Demo Accounts

All accounts have the password: `password123`

| Username | Role | Role |
|----------|------|------|
| SHAHKAR | Manager | Can view all team data |
| ABRAR | Trading | Can update trading info |
| ANSAR | YouTube | Can update YouTube info |

## How to Use

### For YouTube Team (ANSAR)
1. Login as ANSAR
2. Go to "Updates" tab
3. Fill in:
   - Videos created this week
   - Target for next week
   - Add scheduled video titles
   - Notes
4. Click "Save Update"
5. Use discussion tab to chat with others

### For Trading Team (ABRAR)
1. Login as ABRAR
2. Go to "Updates" tab
3. Fill in:
   - Positions opened
   - Positions closed
   - P&L (Profit/Loss)
   - Trading notes
4. Click "Save Update"
5. Use discussion tab to share insights

### For Manager (SHAHKAR)
1. Login as SHAHKAR
2. Go to "Team Dashboard"
3. View all team updates in one place
4. See YouTube progress and Trading performance
5. Participate in discussions to give feedback

## File Structure

```
WorkSync-Pro/
├── backend/
│   ├── server.js          # Express server & API routes
│   ├── package.json       # Backend dependencies
│   ├── .env              # Environment variables
│   └── worksync.db       # SQLite database (created on first run)
│
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── App.js        # Main app component
    │   ├── App.css       # Professional styling
    │   └── index.js      # Entry point
    ├── public/
    │   └── index.html    # HTML template
    └── package.json      # Frontend dependencies
```

## Technology Stack

- **Frontend**: React 18, Axios, CSS3
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT, bcryptjs

## Features Breakdown

### 📊 Dashboard
- Real-time updates from all team members
- Professional color-coded UI
- Mobile-responsive design

### 💬 Discussion Tabs
- YouTube Discussion - Share video strategies
- Trading Discussion - Discuss trades and strategies
- Real-time message updates
- See who said what and when

### 📱 Mobile Friendly
- Works perfectly on phones and tablets
- Responsive layout
- Touch-friendly buttons

### 🔒 Security
- Password-protected accounts
- JWT token authentication
- SQLite database for data persistence

## Troubleshooting

### Backend won't start
```bash
# Make sure you're in the backend folder
cd backend

# Install dependencies if not done
npm install

# Start the server
npm start
```

### Frontend won't start
```bash
# Make sure you're in the frontend folder
cd frontend

# Install dependencies if not done
npm install

# Start the frontend
npm start
```

### "Cannot connect to backend" error
- Make sure backend is running on port 5000
- Check backend console for errors
- Refresh the page

### Database issues
- Delete `backend/worksync.db`
- Restart the backend server
- Database will recreate with fresh data

## Deployment (When Ready)

When you're ready to deploy:
1. Build frontend: `cd frontend && npm run build`
2. Deploy to Vercel (free) - Just push to GitHub
3. Deploy backend to Heroku (free tier) or similar
4. Connect frontend to deployed backend URL

## Notes for Future

- All data is stored locally in SQLite during testing
- Once deployed, you can use a cloud database
- The system auto-saves updates
- Discussions refresh every 3 seconds for real-time feel

---

Built for Team Success 🚀
