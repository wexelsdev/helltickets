// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: config.ts
//  Description: Config loader — reads global.toml and all configs/groups/*.toml, exports typed config objects
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import TOML from '@iarna/toml';
import { GlobalConfig, TicketGroup } from './types';

const CONFIGS_DIR = path.join(__dirname, '../configs');

// ── Global config ────────────────────────────────────────────────────────
const globalRaw = TOML.parse(
    fs.readFileSync(path.join(CONFIGS_DIR, 'global.toml'), 'utf-8'),
) as unknown as GlobalConfig;

export const globalConfig: GlobalConfig = globalRaw;

// ── Ticket groups ─────────────────────────────────────────────────────────
// Automatically loads every .toml file from configs/groups/
const groupsDir = path.join(CONFIGS_DIR, 'groups');

export const ticketGroups: TicketGroup[] = fs
    .readdirSync(groupsDir)
    .filter((f) => f.endsWith('.toml'))
    .map((file) => {
        const raw = TOML.parse(
            fs.readFileSync(path.join(groupsDir, file), 'utf-8'),
        ) as unknown as TicketGroup;
        return raw;
    });

console.log(
    `[config] Loaded ${ticketGroups.length} group(s): ${ticketGroups.map((g) => g.name).join(', ')}`,
);
console.log(
    `[config] Global admin roles: ${globalConfig.adminRoleIds.length}`,
);
