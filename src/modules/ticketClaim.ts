// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: modules/ticketClaim.ts
//  Description: Ticket claiming — admin takes ownership; silent ping; logs to log channel
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import {
    ButtonInteraction,
    ContainerBuilder,
    Guild,
    TextChannel,
    TextDisplayBuilder,
} from 'discord.js';
import { globalConfig, ticketGroups } from '../config';
import { ticketStore } from '../ticketStore';
import { t } from '../i18n';

const CV2 = 32768;
const EPH_V2 = (64 | 32768) as any;

export async function claimTicket(interaction: ButtonInteraction, guild: Guild): Promise<void> {
    const channelId = interaction.channelId;
    const ticketData = ticketStore.get(channelId);

    if (!ticketData) { await interaction.reply({ components: [txt(t.err_channel_not_ticket)], flags: EPH_V2 }); return; }

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) { await interaction.reply({ components: [txt(t.err_member_not_found)], flags: EPH_V2 }); return; }

    const group = ticketGroups.find((g) => g.name === ticketData.groupName);

    const relevantRoleIds = new Set<string>();
    if (group) relevantRoleIds.add(group.staffRoleId);
    for (const id of globalConfig.adminRoleIds) relevantRoleIds.add(id);

    const highestRole = member.roles.cache
        .filter((r) => relevantRoleIds.has(r.id))
        .sort((a, b) => b.position - a.position)
        .first();

    if (!highestRole) { await interaction.reply({ components: [txt(t.claim_no_perm)], flags: EPH_V2 }); return; }
    if (ticketData.claimedBy) {
        await interaction.reply({ components: [txt(t.already_claimed(ticketData.claimedBy))], flags: EPH_V2 });
        return;
    }

    ticketStore.setClaimed(channelId, interaction.user.id, highestRole.id);

    // Grant SendMessages permission specifically to the admin who claimed it
    const channel = interaction.channel as TextChannel;
    await channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true, ManageMessages: true,
    });

    const claimMsgContainer = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(t.claimed_msg(interaction.user.id, highestRole.id)),
        );

    // Silent ping for both <@userId> and <@&roleId>
    await interaction.reply({
        components: [claimMsgContainer],
        flags: CV2 as any,
        allowedMentions: { users: [], roles: [] },
    });

    // Log to log channel
    try {
        const logChannelId = group?.logChannelId ?? globalConfig.logChannelId;
        const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
        if (logChannel?.isTextBased()) {
            await (logChannel as TextChannel).send({
                components: [txt(t.claim_log(channelId, interaction.user.id, highestRole.id, group?.displayName ?? ticketData.groupName))],
                flags: CV2 as any,
            });
        }
    } catch (err) {
        console.error('[ticketClaim] Failed to log claim:', err);
    }
}

function txt(content: string): ContainerBuilder {
    return new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
}
