const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '1543417461238403122';
const KATEGORIA_TICKETOW_ID = '1541436201461088358';
const RANGY = {
    wlasciciel: '1541422738512543826',
    sprzedawca: '1541541509529342062'
};

const commands = [
    new SlashCommandBuilder()
        .setName('createticket')
        .setDescription('Wysyła panel ticketów z formularzami na tym kanale')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    console.log(`Bot ${client.user.tag} jest online!`);
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('Zarejestrowano komendę /createticket!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'createticket') {
            const embed = new EmbedBuilder()
                .setTitle('🛒 BANANSHOP - SYSTEM ZGŁOSZEŃ')
                .setDescription('Wybierz odpowiednią kategorię poniżej, aby otworzyć ticket i wypełnić formularz.')
                .setColor(0xF1C40F);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_zakup').setLabel('Zakup waluty').setStyle(ButtonStyle.Success).setEmoji('🛒'),
                new ButtonBuilder().setCustomId('ticket_sprzedaz').setLabel('Sprzedaż waluty').setStyle(ButtonStyle.Primary).setEmoji('💰'),
                new ButtonBuilder().setCustomId('ticket_nagroda').setLabel('Odbiór nagrody').setStyle(ButtonStyle.Secondary).setEmoji('🎁'),
                new ButtonBuilder().setCustomId('ticket_rekrutacja').setLabel('Rekrutacja').setStyle(ButtonStyle.Danger).setEmoji('💼'),
                new ButtonBuilder().setCustomId('ticket_pomoc').setLabel('Pomoc').setStyle(ButtonStyle.Secondary).setEmoji('❓')
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: 'Pomyślnie wysłano panel ticketów!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'ticket_zakup') {
            const modal = new ModalBuilder().setCustomId('modal_zakup').setTitle('Zakup waluty');
            const p1 = new TextInputBuilder().setCustomId('p_metoda').setLabel('Metoda płatności').setStyle(TextInputStyle.Short).setPlaceholder('np. BLIK').setRequired(true);
            const p2 = new TextInputBuilder().setCustomId('p_budzet').setLabel('Ile masz pieniędzy? (1 - 1000)').setStyle(TextInputStyle.Short).setPlaceholder('np. 50 zł').setRequired(true);
            const p3 = new TextInputBuilder().setCustomId('p_kod').setLabel('Kod rabatowy (opcjonalnie)').setStyle(TextInputStyle.Short).setPlaceholder('Wpisz kod, jeśli posiadasz').setRequired(false);
            modal.addComponents(new ActionRowBuilder().addComponents(p1), new ActionRowBuilder().addComponents(p2), new ActionRowBuilder().addComponents(p3));
            await interaction.showModal(modal);
        } else if (interaction.customId === 'ticket_sprzedaz') {
            const modal = new ModalBuilder().setCustomId('modal_sprzedaz').setTitle('Sprzedaż waluty');
            const p1 = new TextInputBuilder().setCustomId('p_metoda').setLabel('Metoda płatności').setStyle(TextInputStyle.Short).setPlaceholder('np. BLIK').setRequired(true);
            const p2 = new TextInputBuilder().setCustomId('p_ilosc').setLabel('Ile chcesz sprzedać waluty ($)?').setStyle(TextInputStyle.Short).setPlaceholder('np. 500K').setRequired(true);
            const p3 = new TextInputBuilder().setCustomId('p_kod').setLabel('Kod rabatowy (opcjonalnie)').setStyle(TextInputStyle.Short).setPlaceholder('Wpisz kod, jeśli posiadasz').setRequired(false);
            modal.addComponents(new ActionRowBuilder().addComponents(p1), new ActionRowBuilder().addComponents(p2), new ActionRowBuilder().addComponents(p3));
            await interaction.showModal(modal);
        } else if (interaction.customId === 'ticket_nagroda') {
            const modal = new ModalBuilder().setCustomId('modal_nagroda').setTitle('Odbiór nagrody');
            const p1 = new TextInputBuilder().setCustomId('p_powod').setLabel('Za co wygrałeś nagrodę?').setStyle(TextInputStyle.Short).setPlaceholder('np. Za 10 zaproszeń').setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(p1));
            await interaction.showModal(modal);
        } else if (interaction.customId === 'ticket_rekrutacja') {
            const modal = new ModalBuilder().setCustomId('modal_rekrutacja').setTitle('Rekrutacja na sprzedawcę');
            const p1 = new TextInputBuilder().setCustomId('p_wiek').setLabel('Ile masz lat? (1 - 99)').setStyle(TextInputStyle.Short).setPlaceholder('np. 15 lat').setRequired(true);
            const p2 = new TextInputBuilder().setCustomId('p_kaucja').setLabel('Wpłata kaucji (wielokrotność 3, np. 60, 120)').setStyle(TextInputStyle.Short).setPlaceholder('np. 60 zł').setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(p1), new ActionRowBuilder().addComponents(p2));
            await interaction.showModal(modal);
        } else if (interaction.customId === 'ticket_pomoc') {
            const modal = new ModalBuilder().setCustomId('modal_pomoc').setTitle('Pomoc techniczna');
            const p1 = new TextInputBuilder().setCustomId('p_tresc').setLabel('W czym możemy Ci pomóc?').setStyle(TextInputStyle.Paragraph).setPlaceholder('np. mam problem z otwarciem ticketa').setMaxLength(1000).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(p1));
            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const guild = interaction.guild;
        const user = interaction.user;

        let type = '';
        let allowedRoles = [RANGY.wlasciciel, RANGY.sprzedawca];
        let content = '';

        if (interaction.customId === 'modal_zakup') {
            type = 'zakup';
            const m = interaction.fields.getTextInputValue('p_metoda');
            const b = interaction.fields.getTextInputValue('p_budzet');
            const k = interaction.fields.getTextInputValue('p_kod') || 'Brak';
            content = `**Metoda płatności:** ${m}\n**Budżet:** ${b}\n**Kod rabatowy:** ${k}`;
        } else if (interaction.customId === 'modal_sprzedaz') {
            type = 'sprzedaz';
            const m = interaction.fields.getTextInputValue('p_metoda');
            const i = interaction.fields.getTextInputValue('p_ilosc');
            const k = interaction.fields.getTextInputValue('p_kod') || 'Brak';
            content = `**Metoda wypłaty:** ${m}\n**Ilość waluty:** ${i}\n**Kod rabatowy:** ${k}`;
        } else if (interaction.customId === 'modal_nagroda') {
            type = 'nagroda';
            allowedRoles = [RANGY.wlasciciel];
            const p = interaction.fields.getTextInputValue('p_powod');
            content = `**Powód nagrody:** ${p}`;
        } else if (interaction.customId === 'modal_rekrutacja') {
            type = 'rekrutacja';
            allowedRoles = [RANGY.wlasciciel];
            const w = parseInt(interaction.fields.getTextInputValue('p_wiek'));
            const k = parseInt(interaction.fields.getTextInputValue('p_kaucja'));

            if (isNaN(w) || w < 1 || w > 99) {
                return interaction.editReply({ content: 'Błąd: Wiek musi być liczbą od 1 do 99!' });
            }
            if (isNaN(k) || k < 20 || k > 1200 || k % 3 !== 0) {
                return interaction.editReply({ content: 'Błąd: Kaucja musi być w pełni podzielna przez 3 (np. 60, 120) i mieścić się w przedziale 20-1200!' });
            }
            content = `**Wiek:** ${w} lat\n**Kaucja:** ${k} zł`;
        } else if (interaction.customId === 'modal_pomoc') {
            type = 'pomoc';
            allowedRoles = [RANGY.wlasciciel];
            const t = interaction.fields.getTextInputValue('p_tresc');
            content = `**Problem:** ${t}`;
        }

        const channelName = `${type}-${user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        const permissionOverwrites = [
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: RANGY.wlasciciel, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ];

        if (allowedRoles.includes(RANGY.sprzedawca)) {
            permissionOverwrites.push({ id: RANGY.sprzedawca, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] });
        }

        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: KATEGORIA_TICKETOW_ID,
            permissionOverwrites: permissionOverwrites
        });

        const embed = new EmbedBuilder()
            .setTitle(`Zgłoszenie: ${type.toUpperCase()}`)
            .setDescription(`**Autor ticketa:** ${user.tag} (<@${user.id}>)\n\n**Wysłane informacje:**\n${content}`)
            .setColor(0x3498DB);

        let pingRoles = `<@&${RANGY.wlasciciel}>`;
        if (allowedRoles.includes(RANGY.sprzedawca)) {
            pingRoles += ` <@&${RANGO_SPRZEDAWCA || RANGY.sprzedawca}>`;
        }

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Zamknij ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await ticketChannel.send({ content: `<@${user.id}> ${pingRoles}`, embeds: [embed], components: [closeRow] });
        await interaction.editReply({ content: `Utworzono ticket: ${ticketChannel}` });
    } else if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('Zamykanie kanału za 3 sekundy...');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(TOKEN);
              
