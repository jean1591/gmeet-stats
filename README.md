# Google Meet Time Tracker

Track Google Meet session time with automatic analytics dashboard.

## Stack

- **Backend:** NestJS + PostgreSQL + Prisma
- **Frontend:** Next.js + Tailwind + shadcn/ui
- **Extension:** Chrome Manifest V3
- **Deploy:** Docker + nginx-proxy + Let's Encrypt

## Quick Start

### Local Development

```bash
cp .env.example .env
docker-compose up --build

# Services:
# Backend:  http://localhost:3000
# Frontend: http://localhost:3001
# Database: localhost:5432
```

### Production Deployment

```bash
# On VPS with nginx-proxy running
cp .env.example .env
nano .env  # Update POSTGRES_PASSWORD and LETSENCRYPT_EMAIL
docker-compose -f docker-compose.prod.yml up -d --build

# Deployed at:
# Backend:  https://api.stats.rb2.fr
# Frontend: https://stats.rb2.fr
```

### Environment Variables

```env
POSTGRES_USER=gmeet_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=gmeet_stats
LETSENCRYPT_EMAIL=your@email.com
```

## API Endpoints

- `POST /sessions` - Create session
- `PUT /sessions/:id` - Update session
- `GET /sessions/user/:user_id` - Get user sessions

## Common Commands

```bash
# View logs
docker-compose logs -f
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose restart
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose down
docker-compose -f docker-compose.prod.yml down

# Database backup (production)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U gmeet_user gmeet_stats > backup.sql
```
