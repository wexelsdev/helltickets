// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: i18n/ru.ts
//  Description: Russian translations
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import { Lang } from './types';

export const ru: Lang = {
    // — Errors
    err_channel_not_ticket: '❌ Канал не является активным тикетом.',
    err_member_not_found: '❌ Не удалось получить данные участника.',
    err_group_not_found: '❌ Группа тикетов не найдена.',
    err_no_permission: '❌ Недостаточно прав для этого действия.',
    err_no_author: '❌ Не удалось определить автора тикета.',
    err_ticket_create_failed: '❌ Не удалось создать тикет. Попробуйте позже.',
    err_ticket_not_found: '❌ Тикет не найден.',

    // — Init
    init_subtitle: '-# Нажмите кнопку чтобы создать тикет. Дождитесь ответа специалиста.',

    // — Create flow
    already_has_ticket: (id) => `❌ У вас уже есть открытый тикет: <#${id}>`,
    topic_prompt: (g) => `**${g}** — выберите тему обращения:`,
    topic_placeholder: '💬 Выберите тему...',
    ticket_created: (id) => `Тикет создан: <#${id}>`,

    // — Ticket interface
    ticket_heading: (topic, group, authorId) =>
        `<@${authorId}> · **${topic}**\n-# ${group}`,
    btn_close: 'Закрыть',
    btn_claim: 'Взять тикет',

    // — Close flow
    close_confirm: 'Закрыть тикет?',
    btn_confirm: 'Подтвердить',
    btn_cancel: 'Отмена',
    cancelled: 'Отменено.',
    closing: '🔒 Закрываю...',
    closed_msg: (authorId, closerTag) =>
        `🔒 Тикет закрыт · <@${authorId}>\n-# Закрыл: ${closerTag}`,
    btn_reopen: 'Переоткрыть',
    btn_delete: 'Удалить',
    deleting: '🗑️ Удаление...',
    delete_no_perm: '❌ Нет прав для удаления тикета.',
    reopen_msg: (authorId, closerTag) =>
        `🔓 <@${authorId}> Тикет переоткрыт · ${closerTag}`,
    already_claimed: (id) => `⚠️ Тикет уже взят <@${id}>.`,

    // — Claim
    claim_no_perm: '❌ Нет прав для взятия этого тикета.',
    claimed_msg: (adminId, roleId) =>
        `🛡️ <@${adminId}> _(<@&${roleId}>)_ взял тикет.`,
    claim_log: (channelId, adminId, roleId, group) =>
        `🛡️ **Тикет взят** · <#${channelId}>\n<@${adminId}> <@&${roleId}>\n-# ${group}`,

    // — Rating
    rating_prompt: 'Оцените качество поддержки (1 — плохо, 5 — отлично):',
    rating_placeholder: 'Оцените работу поддержки...',
    rating_thanks: (s) => `Спасибо! ${s}`,
    rating_done: (s) => `Оценка: ${s}`,
    rating_labels: ['Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично!'],

    // — Transcript (all IDs → silent pings in caller with allowedMentions)
    transcript_line: (ch, grp, authorId, closerId, adminId, adminRoleId, dur, rating) =>
        [
            `📋 **${ch}** · ${grp}`,
            `👤 Открыл: <@${authorId}>`,
            `🔒 Закрыл: <@${closerId}>`,
            `🛡️ Взял: ${adminId ? `<@${adminId}>${adminRoleId ? ` <@&${adminRoleId}>` : ''}` : '—'}`,
            `⏱️ ${dur}  ·  📊 ${rating}`,
        ].join('\n'),
    transcript_footer: '-# Транскрипт прикреплён',
    log_closed: (ch, authorId, dur, rating, grp) =>
        `🔒 **${ch}** · <@${authorId}>\n-# ${dur} · ${rating} · ${grp}`,
    no_rating: '—',
};
