// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: counter.ts
//  Description: Persistent per-group ticket counter stored in SQLite database
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import TOML from '@iarna/toml';

const DB_FILE = path.join(__dirname, '../database.sqlite');
const OLD_DATA_FILE = path.join(__dirname, '../bot.data');

// ── Database Setup ─────────────────────────────────────────────────────────

export const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
    CREATE TABLE IF NOT EXISTS counters (
        group_name TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
    )
`);

// ── Migration from bot.data ────────────────────────────────────────────────

function migrateFromToml() {
    if (!fs.existsSync(OLD_DATA_FILE)) return;
    try {
        const raw = fs.readFileSync(OLD_DATA_FILE, 'utf-8');
        const parsed = TOML.parse(raw) as Record<string, unknown>;
        const section = parsed['counters'] as Record<string, number> | undefined;

        if (section) {
            const insertStmt = db.prepare(`
                INSERT OR IGNORE INTO counters (group_name, count) VALUES (?, ?)
            `);
            const updateStmt = db.prepare(`
                UPDATE counters SET count = ? WHERE group_name = ? AND count < ?
            `);

            const transaction = db.transaction(() => {
                for (const [group, count] of Object.entries(section)) {
                    insertStmt.run(group, count);
                    updateStmt.run(count, group, count);
                }
            });
            transaction();
        }

        fs.unlinkSync(OLD_DATA_FILE);
        console.log('[counter] Migrated bot.data → SQLite');
    } catch (e) {
        console.error('[counter] Error migrating bot.data:', e);
    }
}

migrateFromToml();

// ── CounterStore ───────────────────────────────────────────────────────────

class CounterStore {
    private getStmt = db.prepare('SELECT count FROM counters WHERE group_name = ?');
    private updateStmt = db.prepare(`
        INSERT INTO counters (group_name, count) VALUES (?, 1)
        ON CONFLICT(group_name) DO UPDATE SET count = count + 1
        RETURNING count
    `);

    /** Increment and persist the counter for a group; returns the new value */
    next(groupName: string): number {
        const row = this.updateStmt.get(groupName) as { count: number };
        return row.count;
    }

    /** Read the current value without incrementing */
    current(groupName: string): number {
        const row = this.getStmt.get(groupName) as { count: number } | undefined;
        return row ? row.count : 0;
    }
}

export const counterStore = new CounterStore();
