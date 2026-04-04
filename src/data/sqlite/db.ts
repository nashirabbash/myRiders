import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens (or returns the cached) SQLite database and ensures all migrations
 * have been applied. Safe to call multiple times — always returns the same
 * database instance.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  const db = await SQLite.openDatabaseAsync("myriders.db", {
    useNewConnection: false,
  });

  // Enable WAL mode for better concurrent read performance
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");

  await runMigrations(db);

  _db = db;
  return db;
}

/**
 * Closes the database. Call only when tearing down (e.g. in tests).
 */
export async function closeDb(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
