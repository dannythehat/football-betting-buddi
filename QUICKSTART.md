# 🚀 Quick Start Guide - FootballBettingBuddi

**Get up and running in 5 minutes**

---

## Prerequisites

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: For version control ([Download](https://git-scm.com/))
- **PowerShell**: Windows (built-in) or [PowerShell Core](https://github.com/PowerShell/PowerShell) for Mac/Linux

---

## Installation

### 1. Clone the Repository

```powershell
# Navigate to your projects folder
cd C:\Users\YourName\Documents\GitHub

# Clone the repository
git clone https://github.com/dannythehat/football-betting-buddi.git

# Enter the project directory
cd football-betting-buddi
```

---

### 2. Install Backend Dependencies

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Return to root
cd ..
```

**Expected output**: `added X packages` (should complete in 30-60 seconds)

---

### 3. Install Frontend Dependencies

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Return to root
cd ..
```

**Expected output**: `added X packages` (should complete in 30-60 seconds)

---

## Running the Application

### Option 1: PowerShell Launcher (Recommended)

```powershell
# Start both backend and frontend
.\dev.ps1

# Your browser will automatically open to http://localhost:3000
```

**What happens**:
1. Backend starts on `http://127.0.0.1:8081`
2. Frontend starts on `http://localhost:3000`
3. Logs are written to `logs/backend.log` and `logs/frontend.log`
4. Browser opens automatically

---

### Option 2: Manual Start

**Terminal 1 (Backend)**:
```powershell
cd backend
npm start
```

**Terminal 2 (Frontend)**:
```powershell
cd frontend
npm run dev
```

Then open your browser to `http://localhost:3000`

---

## Verifying Installation

### 1. Check Backend Health

Open your browser or use curl:
```powershell
curl http://127.0.0.1:8081/api/health
```

**Expected response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T00:00:00.000Z"
}
```

---

### 2. Check Frontend

Navigate to `http://localhost:3000` in your browser.

**Expected**: You should see the FootballBettingBuddi homepage with health status.

---

## PowerShell Launcher Commands

### Start Services
```powershell
.\dev.ps1
```

### Check Status
```powershell
.\dev.ps1 -Status
```

**Output**:
```
Backend Job: Running (ID: 1)
Frontend Job: Running (ID: 2)
```

### Stop Services
```powershell
.\dev.ps1 -Stop
```

**Output**:
```
Stopping backend...
Stopping frontend...
All services stopped.
```

---

## Troubleshooting

### Issue: "Port 8081 already in use"

**Solution**:
```powershell
# Find process using port 8081
netstat -ano | findstr :8081

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Restart the app
.\dev.ps1
```

---

### Issue: "Port 3000 already in use"

**Solution**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Restart the app
.\dev.ps1
```

---

### Issue: "npm: command not found"

**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

After installation, verify:
```powershell
node --version
npm --version
```

---

### Issue: "Cannot run scripts on this system"

**Solution**: Enable PowerShell script execution
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Issue: Frontend shows blank page

**Solution**:
1. Check browser console for errors (F12)
2. Verify backend is running: `curl http://127.0.0.1:8081/api/health`
3. Check `logs/frontend.log` for errors
4. Try clearing browser cache (Ctrl+Shift+R)

---

### Issue: Backend not responding

**Solution**:
1. Check `logs/backend.log` for errors
2. Verify Node.js version: `node --version` (should be 18+)
3. Reinstall dependencies:
   ```powershell
   cd backend
   rm -rf node_modules
   npm install
   ```

---

## Development Workflow

### Daily Workflow

```powershell
# Morning: Pull latest changes
git pull origin main

# Start development
.\dev.ps1

# Make changes to code...

# Test your changes
# (Backend: http://127.0.0.1:8081)
# (Frontend: http://localhost:3000)

# Commit your changes
git add .
git commit -m "feat: description of changes"
git push origin main

# End of day: Stop services
.\dev.ps1 -Stop
```

---

### Testing API Endpoints

```powershell
# Health check
curl http://127.0.0.1:8081/api/health

# Status check (once implemented)
curl http://127.0.0.1:8081/api/status

# Fixtures (once implemented)
curl http://127.0.0.1:8081/api/fixtures

# Smart Bets (once implemented)
curl http://127.0.0.1:8081/api/smart-bets
```

---

## Project Structure

```
football-betting-buddi/
├── backend/              # Express API server
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── public/           # Static files
├── frontend/             # React frontend
│   ├── index.html        # HTML entry point
│   ├── app.js            # Main React component
│   ├── styles.css        # CSS styles
│   └── package.json      # Frontend dependencies
├── data/                 # JSON data files
│   ├── fixtures.json     # Mock fixtures (future)
│   └── smart-bets.json   # Mock smart bets (future)
├── scripts/              # Automation scripts
│   └── generate-mock-data.js  # Data generation (future)
├── logs/                 # Application logs
│   ├── backend.log       # Backend logs
│   └── frontend.log      # Frontend logs
├── docs/                 # Additional documentation
├── dev.ps1               # PowerShell launcher
├── README.md             # Main documentation
├── VISION.md             # Project vision
├── ROADMAP.md            # Development roadmap
├── STATUS.md             # Current status
└── DAILY_PLAN.md         # Daily development tasks
```

---

## Next Steps

1. **Explore the Code**: Check out `backend/server.js` and `frontend/app.js`
2. **Read the Docs**: Review [VISION.md](VISION.md) and [ROADMAP.md](ROADMAP.md)
3. **Follow Daily Plan**: See [DAILY_PLAN.md](DAILY_PLAN.md) for daily tasks
4. **Make Changes**: Start with small improvements
5. **Commit Often**: Use clear commit messages

---

## Useful Commands

### Git Commands
```powershell
# Check status
git status

# View changes
git diff

# Create branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: my feature"

# Push changes
git push origin main
```

### npm Commands
```powershell
# Install dependencies
npm install

# Start development server
npm start  # or npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## Getting Help

- **Documentation**: Check [README.md](README.md) for comprehensive info
- **Issues**: Report bugs on [GitHub Issues](https://github.com/dannythehat/football-betting-buddi/issues)
- **Email**: danqawsedef@gmail.com
- **Status**: Check [STATUS.md](STATUS.md) for current progress

---

## What's Next?

After getting the app running, check out:

1. **[DAILY_PLAN.md](DAILY_PLAN.md)**: See today's development tasks
2. **[ROADMAP.md](ROADMAP.md)**: Understand the long-term plan
3. **[VISION.md](VISION.md)**: Learn about the business vision

---

**Happy Coding! ⚽🤖**

*Last Updated: 2025-11-05*