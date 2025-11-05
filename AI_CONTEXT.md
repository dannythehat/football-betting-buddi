# 🤖 AI Assistant Context - FootballBettingBuddi

**Quick Reference for OpenAI Chat Sessions**

---

## 📍 Where We Are

Run this command to get current state:
```powershell
.\workflow.ps1 -Summary
```

This shows:
- Current phase, week, and day
- Completed tasks today
- Active tasks in progress
- Next tasks coming up
- Any blockers or notes

---

## 🎯 How to Start a Work Session

### 1. Check Current State
```powershell
.\workflow.ps1 -Status
```

### 2. See Next Task
```powershell
.\workflow.ps1 -Next
```

### 3. Start Working on Task
```powershell
.\workflow.ps1 -Start "2.1"  # Replace with actual task ID
```

This will:
- Mark task as "in_progress"
- Open the file to edit in VS Code
- Update WORKFLOW_STATE.json

### 4. Complete Task
```powershell
.\workflow.ps1 -Complete "2.1"
```

This will:
- Move task to completed
- Show git commit command
- Update metrics
- Show next task

---

## 📋 Daily Workflow with OpenAI

### Morning Routine
1. **Pull latest changes**
   ```powershell
   git pull
   ```

2. **Get AI context**
   ```powershell
   .\workflow.ps1 -Summary
   ```

3. **Copy output to OpenAI chat** and say:
   > "Here's where we are today. Let's work on the next task."

4. **Start next task**
   ```powershell
   .\workflow.ps1 -Next
   .\workflow.ps1 -Start "X.X"
   ```

### During Development
- OpenAI helps you write code
- Test locally with `.\dev.ps1`
- Verify acceptance criteria

### After Completing Task
1. **Mark complete**
   ```powershell
   .\workflow.ps1 -Complete "X.X"
   ```

2. **Commit changes** (script shows exact command)
   ```powershell
   git add .
   git commit -m "feat: your commit message"
   git push
   ```

3. **Move to next task**
   ```powershell
   .\workflow.ps1 -Next
   ```

---

## 🗂️ Key Files Reference

### Documentation
- **README.md** - Project overview and quick start
- **VISION.md** - Long-term goals and business model
- **ROADMAP.md** - Development phases and milestones
- **STATUS.md** - Current progress and daily updates
- **DAILY_PLAN.md** - Detailed task breakdown by day
- **WORKFLOW_STATE.json** - Machine-readable current state (THIS IS THE SOURCE OF TRUTH)

### Code
- **backend/server.js** - Express API server
- **frontend/app.js** - React frontend
- **dev.ps1** - Start/stop development servers
- **workflow.ps1** - Workflow state management

### Data
- **data/** - JSON schemas and mock data
- **logs/** - Backend and frontend logs

---

## 💡 Tips for OpenAI Sessions

### Starting a New Chat
Always begin with:
```
I'm working on FootballBettingBuddi. Here's my current state:
[paste output from .\workflow.ps1 -Summary]

Let's work on task [X.X]: [task name]
```

### During Development
- Reference WORKFLOW_STATE.json for acceptance criteria
- Check DAILY_PLAN.md for detailed implementation steps
- Use STATUS.md for broader context

### Ending a Session
Before closing:
1. Complete current task: `.\workflow.ps1 -Complete "X.X"`
2. Commit and push changes
3. Note any blockers or insights in WORKFLOW_STATE.json

---

## 🔄 Updating Workflow State

### Manual Updates (if needed)
Edit `WORKFLOW_STATE.json` directly to:
- Add new tasks
- Update priorities
- Add blockers
- Change focus

### Automatic Updates
The `workflow.ps1` script automatically updates:
- `last_updated` timestamp
- Task statuses
- Completion dates
- Metrics

---

## 🎯 Current Phase Goals

**Phase 1: MVP Foundation (Weeks 1-4)**
- ✅ Repository structure
- 🚧 Backend API with health/status endpoints
- 🚧 Frontend shell with React
- 📋 Fixtures browser
- 📋 Mock Smart Bets

**Success Criteria:**
- Working local development environment
- Basic UI displaying fixtures
- Mock AI predictions
- User dashboard with localStorage

---

## 📞 Quick Commands Cheat Sheet

```powershell
# Development
.\dev.ps1                    # Start servers
.\dev.ps1 -Status            # Check if running
.\dev.ps1 -Stop              # Stop servers

# Workflow
.\workflow.ps1 -Status       # Current state
.\workflow.ps1 -Next         # Next task
.\workflow.ps1 -Summary      # AI context
.\workflow.ps1 -Start "X.X"  # Start task
.\workflow.ps1 -Complete "X.X"  # Finish task

# Git
git status                   # Check changes
git add .                    # Stage all
git commit -m "message"      # Commit
git push                     # Push to GitHub

# Testing
curl http://127.0.0.1:8081/api/health   # Test backend
curl http://127.0.0.1:8081/api/status   # Test status endpoint
```

---

## 🚨 Common Issues

### "Can't find where we left off"
**Solution:** Run `.\workflow.ps1 -Summary` and paste output to OpenAI

### "Not sure what to work on next"
**Solution:** Run `.\workflow.ps1 -Next` to see next task with full details

### "Forgot to update workflow after completing task"
**Solution:** Run `.\workflow.ps1 -Complete "X.X"` retroactively

### "WORKFLOW_STATE.json out of sync"
**Solution:** Manually edit the file or regenerate from DAILY_PLAN.md

---

## 📚 Additional Resources

- **GitHub Repo:** https://github.com/dannythehat/football-betting-buddi
- **Local Frontend:** http://localhost:3000
- **Local Backend:** http://127.0.0.1:8081
- **Logs:** `logs/backend.log`, `logs/frontend.log`

---

**Last Updated:** 2025-11-05  
**Maintained By:** workflow.ps1 script
