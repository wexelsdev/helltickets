// ─────────────────────────────────────────────
//  Project: HellTickets
//  File: modules/rating.ts
//  Description: Asks the ticket author to rate the support quality on a 1–5 scale
//  * Author: Ivan "wexels.dev" Timersky <mail@wexels.dev>
//  Created: 2026-03-01
//  * Copyright (c) 2026 wexels.dev. All rights reserved.
//  Licensed under the MIT License. See LICENSE file in the project root.
// ─────────────────────────────────────────────

import {
    ActionRowBuilder,
    ComponentType,
    ContainerBuilder,
    SeparatorBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextChannel,
    TextDisplayBuilder,
} from 'discord.js';
import { t } from '../i18n';

const CV2 = 32768;
const EPH_V2 = (64 | 32768) as any;
const STARS = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

export async function askForRating(channel: TextChannel, authorId: string): Promise<number | null> {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('rating_select')
        .setPlaceholder(t.rating_placeholder)
        .addOptions(
            STARS.map((stars, i) => ({
                label: `${i + 1} — ${t.rating_labels[i]}`,
                value: String(i + 1),
                description: stars,
            })),
        );

    const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(t.rating_prompt))
        .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
        .addActionRowComponents(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu));

    const ratingMsg = await channel.send({ components: [container], flags: CV2 as any });

    try {
        const collected = await channel.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            filter: (i: StringSelectMenuInteraction) =>
                i.customId === 'rating_select' && i.user.id === authorId,
            time: 60_000,
        });

        const value = parseInt(collected.values[0], 10);

        await collected.reply({
            components: [txt(t.rating_thanks(STARS[value - 1]))],
            flags: EPH_V2,
        });

        const disabledMenu = StringSelectMenuBuilder.from(menu).setDisabled(true);
        await ratingMsg.edit({
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(t.rating_done(STARS[value - 1])))
                    .addActionRowComponents(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(disabledMenu)),
            ],
            flags: CV2 as any,
        });

        return value;
    } catch {
        return null;
    }
}

function txt(content: string): ContainerBuilder {
    return new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
}
