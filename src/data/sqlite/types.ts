export type SessionStatus =
  | "recording"
  | "paused"
  | "finished_local"
  | "pending_sync"
  | "synced";

export type VehicleType = "motorbike" | "car" | "other";

export type BatchStatus = "pending" | "uploading" | "accepted" | "failed";

export interface LocalSession {
  id: string;
  idempotencyKey: string;
  vehicleType: VehicleType;
  status: SessionStatus;
  startedAt: number;         // Unix ms
  endedAt?: number;
  durationSec?: number;
  distanceM?: number;
  avgSpeedKph?: number;
  topSpeedKph?: number;
  pointCount: number;
  cloudTripId?: string;
  syncAttemptCount: number;
  lastSyncError?: string;
  nextRetryAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface LocalPointRaw {
  id?: number;
  sessionId: string;
  seq: number;
  capturedAt: number;        // Unix ms
  latE7: number;
  lngE7: number;
  accuracyM?: number;
  speedKph?: number;
  altitudeM?: number;
  headingDeg?: number;
}

export interface LocalPointSanitized extends Omit<LocalPointRaw, "id"> {
  id?: number;
}

export interface LocalSyncBatch {
  id?: number;
  sessionId: string;
  batchIndex: number;
  batchTotal: number;
  batchIdempotencyKey: string;
  pointStartSeq: number;
  pointEndSeq: number;
  payloadSha256?: string;
  status: BatchStatus;
  attemptCount: number;
  lastError?: string;
  createdAt: number;
  updatedAt: number;
}
