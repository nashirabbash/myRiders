import type { SQLiteDatabase } from "expo-sqlite";

export interface Migration {
  version: number;
  up: string;
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: `
      -- Local session state machine
      -- Statuses: idle | recording | paused | finished_local | pending_sync | synced

      CREATE TABLE IF NOT EXISTS local_sessions (
        id                    TEXT    PRIMARY KEY,   -- client UUID
        idempotency_key       TEXT    NOT NULL UNIQUE,
        vehicle_type          TEXT    NOT NULL CHECK (vehicle_type IN ('motorbike', 'car', 'other')),
        status                TEXT    NOT NULL DEFAULT 'recording'
                                        CHECK (status IN ('recording', 'paused', 'finished_local', 'pending_sync', 'synced')),
        started_at            INTEGER NOT NULL,      -- Unix ms
        ended_at              INTEGER,               -- Unix ms; set on Stop
        duration_sec          REAL,
        distance_m            REAL,
        avg_speed_kph         REAL,
        top_speed_kph         REAL,
        point_count           INTEGER NOT NULL DEFAULT 0,
        cloud_trip_id         TEXT,                  -- server-assigned UUID after sync
        sync_attempt_count    INTEGER NOT NULL DEFAULT 0,
        last_sync_error       TEXT,
        next_retry_at         INTEGER,               -- Unix ms
        created_at            INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at            INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      );

      -- Raw GPS samples as captured from the sensor — immutable after insert
      CREATE TABLE IF NOT EXISTS local_points_raw (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id      TEXT    NOT NULL REFERENCES local_sessions(id) ON DELETE CASCADE,
        seq             INTEGER NOT NULL,
        captured_at     INTEGER NOT NULL,   -- Unix ms
        lat_e7          INTEGER NOT NULL,   -- latitude  × 1e7
        lng_e7          INTEGER NOT NULL,   -- longitude × 1e7
        accuracy_m      REAL,
        speed_kph       REAL,
        altitude_m      REAL,
        heading_deg     REAL,
        UNIQUE (session_id, seq)
      );

      CREATE INDEX IF NOT EXISTS local_points_raw_session_idx
        ON local_points_raw (session_id, captured_at);

      -- Sanitized points after edge-side pruning (Douglas-Peucker + outlier rejection)
      CREATE TABLE IF NOT EXISTS local_points_sanitized (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id      TEXT    NOT NULL REFERENCES local_sessions(id) ON DELETE CASCADE,
        seq             INTEGER NOT NULL,
        captured_at     INTEGER NOT NULL,   -- Unix ms
        lat_e7          INTEGER NOT NULL,
        lng_e7          INTEGER NOT NULL,
        accuracy_m      REAL,
        speed_kph       REAL,
        altitude_m      REAL,
        heading_deg     REAL,
        UNIQUE (session_id, seq)
      );

      CREATE INDEX IF NOT EXISTS local_points_sanitized_session_idx
        ON local_points_sanitized (session_id, seq);

      -- Sync batch queue — one row per batch per upload attempt
      CREATE TABLE IF NOT EXISTS local_sync_batches (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id            TEXT    NOT NULL REFERENCES local_sessions(id) ON DELETE CASCADE,
        batch_index           INTEGER NOT NULL,
        batch_total           INTEGER NOT NULL,
        batch_idempotency_key TEXT    NOT NULL UNIQUE,
        point_start_seq       INTEGER NOT NULL,
        point_end_seq         INTEGER NOT NULL,
        payload_sha256        TEXT,
        status                TEXT    NOT NULL DEFAULT 'pending'
                                        CHECK (status IN ('pending', 'uploading', 'accepted', 'failed')),
        attempt_count         INTEGER NOT NULL DEFAULT 0,
        last_error            TEXT,
        created_at            INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at            INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        UNIQUE (session_id, batch_index)
      );
    `,
  },
];

/**
 * Applies any pending migrations to the database.
 * Idempotent: safe to call on every app start.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    "SELECT version FROM schema_migrations ORDER BY version ASC"
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;

    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.up);
      await db.runAsync(
        "INSERT INTO schema_migrations (version) VALUES (?)",
        migration.version
      );
    });
  }
}
