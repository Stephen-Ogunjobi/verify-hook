import { database } from "./connection";

export function initializeDatabase(): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      webhook_id TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,

      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
          status IN (
            'pending',
            'processing',
            'succeeded',
            'failed',
            'dead_letter'
          )
        ),

      attempt_count INTEGER NOT NULL DEFAULT 0
        CHECK (attempt_count >= 0),

      next_retry_at TEXT,
      last_error TEXT,

      received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      processed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_webhook_events_retry
      ON webhook_events(status, next_retry_at);

    CREATE TABLE IF NOT EXISTS webhook_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  webhook_event_id INTEGER NOT NULL,
  kind TEXT NOT NULL
    CHECK (kind IN ('delivery', 'processing')),

  attempt_number INTEGER,
  outcome TEXT NOT NULL
    CHECK (
      outcome IN (
        'accepted',
        'duplicate',
        'succeeded',
        'failed',
        'dead_letter'
      )
    ),

  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (webhook_event_id)
    REFERENCES webhook_events(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhook_attempts_event
  ON webhook_attempts(webhook_event_id, created_at);
  `);
}
