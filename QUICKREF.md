# 🚀 Quick Reference Card - FootballBettingBuddi

**Keep this handy for daily development!**

---

## 📍 Where Am I?

```powershell
.\workflow.ps1 -Summary
```
**Copy output to OpenAI to get context**

---

## 🎯 What's Next?

```powershell
.\workflow.ps1 -Next
```
Shows next task with acceptance criteria

---

## ⚡ Quick Commands

### Development
```powershell
.\dev.ps1              # Start servers
.\dev.ps1 -Status      # Check if running
.\dev.ps1 -Stop        # Stop servers
```

### Workflow
```powershell
.\workflow.ps1 -Status           # Current state
.\workflow.ps1 -Next             # Next task
.\workflow.ps1 -Start "2.1"      # Start task 2.1
.\workflow.ps1 -Complete "2.1"   # Finish task 2.1
```

### Git
```powershell
git status             # Check changes
git add .              # Stage all
git commit -m "msg"    # Commit
git push               # Push to GitHub
```

### Testing
```powershell
curl http://127.0.0.1:8081/api/health   # Backend health
curl http://127.0.0.1:8081/api/status   # Backend status
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `WORKFLOW_STATE.json` | Current state (source of truth) |
| `workflow.ps1` | Workflow management script |
| `AI_CONTEXT.md` | OpenAI session guide |
| `DAILY_PLAN.md` | Detailed task breakdown |
| `STATUS.md` | Daily progress updates |
| `backend/server.js` | Express API |
| `frontend/app.js` | React frontend |

---

## 🔄 Daily Routine

### Morning
1. `git pull`
2. `.\workflow.ps1 -Summary`
3. Paste to OpenAI: "Here's where we are. Let's work on next task."
4. `.\workflow.ps1 -Next`
5. `.\workflow.ps1 -Start "X.X"`

### During Dev
- OpenAI helps write code
- Test with `.\dev.ps1`
- Check acceptance criteria

### After Task
1. `.\workflow.ps1 -Complete "X.X"`
2. `git add .`
3. `git commit -m "message"`
4. `git push`
5. `.\workflow.ps1 -Next`

---

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend**: http://127.0.0.1:8081
- **Health**: http://127.0.0.1:8081/api/health
- **GitHub**: https://github.com/dannythehat/football-betting-buddi

---

## 🆘 Common Issues

**"Where are we?"**
→ `.\workflow.ps1 -Summary`

**"What's next?"**
→ `.\workflow.ps1 -Next`

**"Forgot to mark complete"**
→ `.\workflow.ps1 -Complete "X.X"`

**"Servers not starting"**
→ `.\dev.ps1 -Stop` then `.\dev.ps1`

---

## 💡 Pro Tips

- Always run `.\workflow.ps1 -Summary` before OpenAI sessions
- Commit after each completed task
- Keep WORKFLOW_STATE.json updated
- Check logs in `logs/` folder for debugging
- Use `.\workflow.ps1 -Status` to see big picture

---

**Last Updated**: 2025-11-05  
**Current Phase**: Phase 1 - MVP Foundation
