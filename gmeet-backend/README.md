# Google Meet Stats Backend

NestJS backend API for tracking Google Meet session data from the Chrome extension.

## Features

- **PostgreSQL Database**: Prisma ORM for database management
- **RESTful API**: Session tracking endpoints
- **UUID-based Sessions**: User and session identification via UUIDs
- **Docker Support**: Containerized deployment with Docker Compose
- **CORS Enabled**: Ready for browser extension integration

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (for containerized setup)
- PostgreSQL 16+ (if running without Docker)

## Installation

### Option 1: Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL credentials.

3. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

5. **Start the development server:**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

### Option 2: Docker Compose (Recommended)

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

This will:
- Start PostgreSQL container
- Build and start the NestJS backend
- Run database migrations automatically
- Expose the API on port 3000

2. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Create Session
**POST** `/sessions`

Creates a new Google Meet session. The backend generates and returns the session ID.

**Request Body:**
```json
{
  "user_id": "user-uuid-v4",
  "start_time": "2023-01-01T12:00:00.000Z",
  "end_time": "2023-01-01T12:00:00.000Z"
}
```

**Response:** `201 Created`
```json
{
  "id": "generated-session-uuid",
  "user_id": "user-uuid-v4",
  "start_time": "2023-01-01T12:00:00.000Z",
  "end_time": "2023-01-01T12:00:00.000Z",
  "created_at": "2023-01-01T12:00:00.000Z",
  "updated_at": "2023-01-01T12:00:00.000Z"
}
```

**Errors:**
- `400 Bad Request`: Invalid data or end_time < start_time

### Update Session
**PUT** `/sessions/:id`

Updates the end_time of an existing session.

**URL Parameters:**
- `id`: Session ID (returned from POST /sessions)

**Request Body:**
```json
{
  "end_time": "2023-01-01T12:30:00.000Z"
}
```

**Response:** `200 OK`
- Returns the updated session object

**Errors:**
- `404 Not Found`: Session doesn't exist
- `400 Bad Request`: end_time < start_time

### Get User Sessions
**GET** `/sessions/user/:user_id`

Retrieves all sessions for a specific user, ordered by start_time (most recent first).

**URL Parameters:**
- `user_id`: User UUID

**Response:** `200 OK`
```json
[
  {
    "id": "session-uuid",
    "user_id": "user-uuid",
    "start_time": "2023-01-01T12:00:00.000Z",
    "end_time": "2023-01-01T12:30:00.000Z",
    "created_at": "2023-01-01T12:00:00.000Z",
    "updated_at": "2023-01-01T12:30:00.000Z"
  }
]
```

Returns empty array if no sessions found.

## Database Schema

```prisma
model Session {
  id         String   @id @default(uuid()) @db.Uuid
  user_id    String   @db.Uuid
  start_time DateTime
  end_time   DateTime
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([user_id])
}
```

## Development Scripts

```bash
# Build the application
npm run build

# Start production server
npm run start:prod

# Generate Prisma Client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/gmeet_stats` |
| `PORT` | API server port | `3000` |

## Project Structure

```
gmeet-backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── prisma/                # Prisma service
│   ├── sessions/              # Sessions module
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── sessions.controller.ts
│   │   ├── sessions.service.ts
│   │   └── sessions.module.ts
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Production Deployment

1. Update `.env` with production database credentials
2. Configure CORS in `src/main.ts` to allow only your domains
3. Use Docker Compose or deploy to your VPS:
   ```bash
   docker-compose up -d
   ```

## Notes

- CORS is currently set to allow all origins (`*`). Update this in production.
- Database data is persisted in a Docker volume (`postgres_data`) and survives `docker-compose down`. Only `docker-compose down -v` will delete the data.

## Extension Integration Flow

1. Extension sends POST request with `user_id`, `start_time`, and `end_time`
2. Backend generates session `id` and returns it in the response
3. Extension stores the returned `id` locally
4. Extension sends PUT requests with the stored `id` to update `end_time`
5. When no Meet tabs found, extension sends final PUT and clears local storage
