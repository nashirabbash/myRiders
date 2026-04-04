import type { SQLiteDatabase } from "expo-sqlite";
import type { LocalPointRaw, LocalPointSanitized } from "./types";

// ─── Raw points ───────────────────────────────────────────────────────────────

export async function insertRawPoint(
  db: SQLiteDatabase,
  point: Omit<LocalPointRaw, "id">
): Promise<void> {
  await db.runAsync(
    `INSERT OR IGNORE INTO local_points_raw
       (session_id, seq, captured_at, lat_e7, lng_e7, accuracy_m, speed_kph, altitude_m, heading_deg)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    point.sessionId,
    point.seq,
    point.capturedAt,
    point.latE7,
    point.lngE7,
    point.accuracyM ?? null,
    point.speedKph ?? null,
    point.altitudeM ?? null,
    point.headingDeg ?? null
  );
}

export async function getRawPoints(
  db: SQLiteDatabase,
  sessionId: string
): Promise<LocalPointRaw[]> {
  return db.getAllAsync<LocalPointRaw>(
    `SELECT id, session_id as sessionId, seq, captured_at as capturedAt,
            lat_e7 as latE7, lng_e7 as lngE7, accuracy_m as accuracyM,
            speed_kph as speedKph, altitude_m as altitudeM, heading_deg as headingDeg
     FROM local_points_raw
     WHERE session_id = ?
     ORDER BY seq ASC`,
    sessionId
  );
}

export async function countRawPoints(
  db: SQLiteDatabase,
  sessionId: string
): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM local_points_raw WHERE session_id = ?",
    sessionId
  );
  return row?.n ?? 0;
}

// ─── Sanitized points ─────────────────────────────────────────────────────────

export async function upsertSanitizedPoints(
  db: SQLiteDatabase,
  points: Omit<LocalPointSanitized, "id">[]
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const p of points) {
      await db.runAsync(
        `INSERT OR REPLACE INTO local_points_sanitized
           (session_id, seq, captured_at, lat_e7, lng_e7, accuracy_m, speed_kph, altitude_m, heading_deg)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p.sessionId,
        p.seq,
        p.capturedAt,
        p.latE7,
        p.lngE7,
        p.accuracyM ?? null,
        p.speedKph ?? null,
        p.altitudeM ?? null,
        p.headingDeg ?? null
      );
    }
  });
}

export async function getSanitizedPoints(
  db: SQLiteDatabase,
  sessionId: string
): Promise<LocalPointSanitized[]> {
  return db.getAllAsync<LocalPointSanitized>(
    `SELECT id, session_id as sessionId, seq, captured_at as capturedAt,
            lat_e7 as latE7, lng_e7 as lngE7, accuracy_m as accuracyM,
            speed_kph as speedKph, altitude_m as altitudeM, heading_deg as headingDeg
     FROM local_points_sanitized
     WHERE session_id = ?
     ORDER BY seq ASC`,
    sessionId
  );
}

export async function deleteSanitizedPoints(
  db: SQLiteDatabase,
  sessionId: string
): Promise<void> {
  await db.runAsync(
    "DELETE FROM local_points_sanitized WHERE session_id = ?",
    sessionId
  );
}
