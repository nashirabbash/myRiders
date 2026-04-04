/**
 * Unit tests for session state-transition logic.
 * These tests exercise isValidTransition() which is pure — no SQLite needed.
 */
import { isValidTransition } from "../session-repository";
import type { SessionStatus } from "../types";

describe("isValidTransition", () => {
  const validCases: [SessionStatus, SessionStatus][] = [
    ["recording", "paused"],
    ["recording", "finished_local"],
    ["paused", "recording"],
    ["paused", "finished_local"],
    ["finished_local", "pending_sync"],
    ["finished_local", "synced"],
    ["pending_sync", "synced"],
    ["pending_sync", "pending_sync"], // retry-count update
  ];

  test.each(validCases)("%s → %s is allowed", (from, to) => {
    expect(isValidTransition(from, to)).toBe(true);
  });

  const invalidCases: [SessionStatus, SessionStatus][] = [
    ["recording", "synced"],
    ["recording", "pending_sync"],
    ["paused", "synced"],
    ["paused", "pending_sync"],
    ["finished_local", "recording"],
    ["finished_local", "paused"],
    ["synced", "recording"],
    ["synced", "pending_sync"],
    ["synced", "finished_local"],
  ];

  test.each(invalidCases)("%s → %s is rejected", (from, to) => {
    expect(isValidTransition(from, to)).toBe(false);
  });
});
