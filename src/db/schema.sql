CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  idempotency_key UUID NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  channel VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_notifications_idempotency_key ON notifications(idempotency_key);
CREATE INDEX idx_notifications_status ON notifications(status);