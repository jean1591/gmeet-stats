# Claude Code Project Guidelines

This file contains persistent guidelines for AI assistance on this project. Follow these rules in every conversation unless explicitly overridden by the user.

---

## Testing

- **NEVER** run tests automatically
- Do not use `npm test`, `pytest`, `jest`, or any testing commands
- Do not propose adding test coverage or writing tests proactively

---

## Build & Deployment

- **Always ask** about rebuilding containers after TypeScript, React, or backend code changes
- Remind user: "You'll need to rebuild the frontend/backend for these changes to take effect"
- Local development: `docker-compose up -d --build [service]`
- Production deployment: `docker-compose -f docker-compose.prod.yml up -d --build [service]`
- Services: `postgres`, `backend`, `frontend`

---

## Architecture Decisions

### Backend (NestJS)
- Backend handles **all computation and data aggregation**
- Use Prisma for all database operations
- Return pre-computed statistics, not raw data
- All timestamps must be in **UTC** (never local timezone)
- Use proper DTOs for API responses

### Frontend (Next.js)
- Frontend **only displays** pre-computed data from backend
- No heavy computation in React components
- Minimal useMemo usage (only for UI transformations)
- Convert milliseconds to minutes/hours for display

### Extension (Chrome)
- Use `chrome.storage.sync` for persistent data (NOT localStorage)
- UUID stored in: `chrome.storage.sync['userUUID']`
- Background script handles session tracking
- Popup displays current status only

### Database
- PostgreSQL with Prisma ORM
- All timestamps stored as UTC
- Use proper indexes for performance
- No direct SQL unless necessary

---

## Code Style & Communication

### Response Style
- **Concise responses** (< 4 lines for simple questions/confirmations)
- No unnecessary preambles ("Sure! I'd be happy to help...")
- No unnecessary postambles ("Let me know if you need anything else!")
- Direct answers to direct questions
- Provide context only when task is complex or ambiguous

### Code Comments
- Add comments only when logic is non-obvious
- Don't add comments that just restate the code
- Focus on "why" not "what"

### Explanations
- Minimal explanations unless user requests details
- After completing a task, briefly confirm completion
- Don't explain what you just did unless it's complex

---

## Git & Version Control

Never run git command yourself unless instructed to

---

## Workflow & Task Management

### Todo Lists
- Use `TodoWrite` for multi-step tasks (3+ steps)
- Update todo status in real-time as work progresses
- Mark tasks completed immediately after finishing
- Always have exactly ONE task as `in_progress`
- Remove or complete stale todos

### Task Execution
- Read files before editing them
- Use parallel tool calls when operations are independent
- Use sequential execution when operations depend on previous results
- Verify assumptions by checking actual code/config

---

## Technology Stack Reference

### Backend
- **Framework:** NestJS 10.x
- **Database:** PostgreSQL 16
- **ORM:** Prisma 6.x
- **Validation:** class-validator
- **Port:** 3000

### Frontend
- **Framework:** Next.js 15.x (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React hooks (useState, useEffect, useMemo)
- **Port:** 3000 (in container), exposed as 3001 locally

### Extension
- **Platform:** Chrome Manifest V3
- **Storage:** chrome.storage.sync
- **Permissions:** tabs, alarms, storage

### Infrastructure
- **Containers:** Docker + Docker Compose
- **Reverse Proxy:** nginx-proxy
- **SSL:** letsencrypt-companion
- **Production Domain:** stats.rb2.fr (frontend), api.stats.rb2.fr (backend)

---

## Common Patterns

### Duration Handling
- Backend stores/computes in **milliseconds**
- Frontend converts to minutes: `Math.round(ms / 1000 / 60)`
- Display format: `${hours}h ${minutes}m`

### Error Handling
- Backend: NestJS exceptions (BadRequestException, NotFoundException)
- Frontend: try/catch with user-friendly error messages
- Prisma: Handle P2023 (invalid UUID) gracefully

---

## Anti-Patterns to Avoid

❌ Running tests automatically
❌ Heavy computation in frontend
❌ Using localStorage in Chrome extension
❌ User git without user request
❌ Verbose explanations for simple tasks
❌ Adding todos for single-step tasks
❌ Using relative paths in tool calls
❌ Forgetting to rebuild after code changes

---

**Last Updated:** 2025-10-08
**Project:** Google Meet Time Tracker
