# notification-service

A notification service built with Node.js, TypeScript, PostgreSQL, Redis, and BullMQ.

## Setup

1. Start the services:
   ```bash
   docker-compose up -d
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the database migrations:
   ```bash
   psql -h localhost -U user -d notification_db -f src/db/schema.sql
   ```

4. Start the API server:
   ```bash
   npm run dev
   ```

5. In another terminal, start the worker:
   ```bash
   npm run worker
   ```

## Worker Features

- **Job Processing**: Pulls jobs from queue, marks as processing, sends email, marks as sent
- **Retries**: Automatic retry with exponential backoff (up to 5 attempts)
- **Dead-Letter Queue**: Failed jobs after 5 attempts are moved to dead-letter queue
- **Failure Safety**:
  - Handles worker crashes mid-send (BullMQ retries)
  - Prevents duplicate sends by checking status
  - Provider timeouts are handled via async operations
  - Database reconnections are managed by connection pooling

## API

### POST /notifications

Queues a notification for sending.

**Request Body:**
```json
{
  "idempotency_key": "uuid",
  "user_id": 123,
  "channel": "email",
  "payload": {
    "to": "user@email.com",
    "subject": "Verify",
    "body": "..."
  }
}
```

**Response:** 202 Accepted