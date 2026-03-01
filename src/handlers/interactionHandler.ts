// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: handlers/interactionHandler.ts
//  Description: Central interaction router — dispatches buttons, select menus and modal submits
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import {
    ButtonInteraction,
    Client,
    Guild,
    Interaction,
    Message,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import { ticketStore } from '../ticketStore';
import { createTicket, handleTopicPreselect, handleModalSubmit } from '../modules/ticketCreate';
import {
    closeTicket,
    confirmClose,
    cancelClose,
    reopenTicket,
    deleteTicket,
} from '../modules/ticketClose';
import { claimTicket } from '../modules/ticketClaim';

export async function handleInteraction(
    interaction: Interaction,
    client: Client,
    guild: Guild,
): Promise<void> {
    // ── Buttons ──────────────────────────────────────────────────────────
    if (interaction.isButton()) {
        const btn = interaction as ButtonInteraction;
        const id = btn.customId;

        if (id.startsWith('create_ticket_')) { await createTicket(btn, guild); return; }
        if (id === 'close_ticket') { await closeTicket(btn); return; }
        if (id === 'confirm_close') { await confirmClose(btn, client, guild); return; }
        if (id === 'cancel_close') { await cancelClose(btn); return; }
        if (id === 'claim_ticket') { await claimTicket(btn, guild); return; }
        if (id === 'reopen_ticket') { await reopenTicket(btn, guild); return; }
        if (id === 'delete_ticket') { await deleteTicket(btn, guild); return; }
    }

    // ── Select menus ─────────────────────────────────────────────────────
    if (interaction.isStringSelectMenu()) {
        const menu = interaction as StringSelectMenuInteraction;
        if (menu.customId.startsWith('topic_preselect_')) {
            await handleTopicPreselect(menu);
            return;
        }
        // rating_select handled via awaitMessageComponent collector in rating.ts
    }

    // ── Modals ────────────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
        const modal = interaction as ModalSubmitInteraction;
        if (modal.customId.startsWith('modal_ticket_')) {
            await handleModalSubmit(modal, guild);
            return;
        }
    }
}

// ─────────────────────────────────────────────
//  Message tracker — marks tickets as "active"
// ─────────────────────────────────────────────

export function handleMessageCreate(message: Message): void {
    if (message.author.bot) return;
    if (ticketStore.has(message.channelId)) {
        ticketStore.markUserMessage(message.channelId);
    }
}
