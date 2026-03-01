// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: i18n/index.ts
//  Description: Language loader — reads language from global config and exports the active translation set
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import { Lang } from './types';
import { ru } from './ru';
import { en } from './en';

const languages: Record<string, Lang> = { ru, en };

/**
 * Active translation set.
 * Loaded once at startup from globalConfig.language.
 * Falls back to Russian if the configured language is unknown.
 */
function loadLang(): Lang {
    // Lazy import to avoid circular dependency with config
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cfg = require('../config').globalConfig as { language?: string };
    const key = (cfg.language ?? 'ru').toLowerCase();
    return languages[key] ?? ru;
}

export const t: Lang = loadLang();
