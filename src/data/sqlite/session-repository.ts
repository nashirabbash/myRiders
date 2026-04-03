import type { SQLiteDatabase } from "expo-sqlite";
import type { LocalSession, SessionStatus, VehicleType } from "./types";

// ─── Valid state transitions ───────────────────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  recording:       ["paused", "finished_local"],
  paused:          ["recording", "finished_local"],
  finished_local:  ["pending_sync", "synced"],
  pending_sync:    ["synced", "pending_sync"],   // pending_sync → pending_sync allows retry-count update
  synced:          [],
};

export function isValidTransition(from: SessionStatus, to: SessionStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

type SessionRow = {
  id: string;
  idempotency_key: string;
  vehicle_type: VehicleType;
  status: SessionStatus;
  started_at: number;
  ended_at: number | null;
  duration_sec: number | null;
  distance_m: number | null;
  avg_speed_kph: number | null;
  top_speed_kph: number | null;
  point_count: number;
  cloud_trip_id: string | null;
  sync_attempt_count: number;
  last_sync_error: string | null;
  next_retry_at: number | null;
  created_at: number;
  updated_at: number;
};

function rowToSession(row: SessionRow): LocalSession {
  return {
    id: row.id,
    idempotencyKey: row.idempotency_key,
    vehicleType: row.vehicle_type,
    status: row.status,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    durationSec: row.duration_sec ?? undefined,
    distanceM: row.distance_m ?? undefined,
    avgSpeedKph: row.avg_speed_kph ?? undefined,
    topSpeedKph: row.top_speed_kph ?? undefined,
    pointCount: row.point_count,
    cloudTripId: row.cloud_trip_id ?? undefined,
    syncAttemptCount: row.sync_attempt_count,
    lastSyncError: row.last_sync_error ?? undefined,
    nextRetryAt: row.next_retry_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export async function createSession(
  db: SQLiteDatabase,
  params: {
    id: string;
    idempotencyKey: string;
    vehicleType: VehicleType;
    startedAt: number;
  }
): Promise<LocalSession> {
  await db.runAsync(
    `INSERT INTO local_sessions
       (id, idempotency_key, vehicle_type, status, started_at)
     VALUES (?, ?, ?, 'recording', ?)`,
    params.id,
    params.idempotencyKey,
    params.vehicleType,
    params.startedAt
  );
  return getSessionById(db, params.id) as Promise<LocalSession>;
}

export async function getSessionById(
  db: SQLiteDatabase,
  id: string
): Promise<LocalSession | null> {
  const row = await db.getFirstAsync<SessionRow>(
    "SELECT * FROM local_sessions WHERE id = ?",
    id
  );
  return row ? rowToSession(row) : null;
}

export async function listSessions(
  db: SQLiteDatabase,
  filter?: { status?: SessionStatus }
): Promise<LocalSession[]> {
  const rows = filter?.status
    ? await db.getAllAsync<SessionRow>(
        "SELECT * FROM local_sessions WHERE status = ? ORDER BY started_at DESC",
        filter.status
      )
    : await db.getAllAsync<SessionRow>(
        "SELECT * FROM local_sessions ORDER BY started_at DESC"
      );
  return rows.map(rowToSession);
}

export async function transitionStatus(
  db: SQLiteDatabase,
  id: string,
  to: SessionStatus,
  extra?: Partial<
    Pick<
      LocalSession,
      | "endedAt"
      | "durationSec"
      | "distanceM"
      | "avgSpeedKph"
      | "topSpeedKph"
      | "cloudTripId"
      | "syncAttemptCount"
      | "lastSyncError"
      | "nextRetryAt"
    >
  >
): Promise<LocalSession> {
  const session = await getSessionById(db, id);
  if (!session) throw new Error(`Session ${id} not found`);

  if (!isValidTransition(session.status, to)) {
    throw new Error(
      `Invalid transition: ${session.status} → ${to} for session ${id}`
    );
  }

  const now = Date.now();
  await db.runAsync(
    `UPDATE local_sessions SET
       status              = ?,
       ended_at            = COALESCE(?, ended_at),
       duration_sec        = COALESCE(?, duration_sec),
       distance_m          = COALESCE(?, distance_m),
       avg_speed_kph       = COALESCE(?, avg_speed_kph),
       top_speed_kph       = COALESCE(?, top_speed_kph),
       cloud_trip_id       = COALESCE(?, cloud_trip_id),
       sync_attempt_count  = COALESCE(?, sync_attempt_count),
       last_sync_error     = ?,
       next_retry_at       = ?,
       updated_at          = ?
     WHERE id = ?`,
    to,
    extra?.endedAt ?? null,
    extra?.durationSec ?? null,
    extra?.distanceM ?? null,
    extra?.avgSpeedKph ?? null,
    extra?.topSpeedKph ?? null,
    extra?.cloudTripId ?? null,
    extra?.syncAttemptCount ?? null,
    extra?.lastSyncError ?? null,
    extra?.nextRetryAt ?? null,
    now,
    id
  );

  return getSessionById(db, id) as Promise<LocalSession>;
}

export async function incrementPointCount(
  db: SQLiteDatabase,
  id: string,
  delta = 1
): Promise<void> {
  await db.runAsync(
    "UPDATE local_sessions SET point_count = point_count + ?, updated_at = ? WHERE id = ?",
    delta,
    Date.now(),
    id
  );
}
