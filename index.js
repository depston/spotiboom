const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const SpotifyWebApi = require('spotify-web-api-node');
const play = require('play-dl');
require('dotenv').config({ path: './config.env' });

// Создаем клиент Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Spotify API
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Коллекции для хранения данных
client.commands = new Collection();
client.queues = new Map();
client.players = new Map();

// Префикс команд
const PREFIX = process.env.BOT_PREFIX || '!';

// Функция для получения Spotify токена
async function getSpotifyToken() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body.access_token);
        console.log('Spotify токен получен успешно');
    } catch (error) {
        console.error('Ошибка получения Spotify токена:', error);
    }
}

// Функция для поиска трека в Spotify
async function searchSpotifyTrack(query) {
    try {
        const results = await spotifyApi.searchTracks(query, { limit: 1 });
        if (results.body.tracks.items.length > 0) {
            return results.body.tracks.items[0];
        }
        return null;
    } catch (error) {
        console.error('Ошибка поиска в Spotify:', error);
        return null;
    }
}

// Функция для воспроизведения музыки
async function playMusic(interaction, query) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
        return interaction.reply('❌ Вы должны быть в голосовом канале!');
    }

    try {
        // Сначала ищем в Spotify
        const spotifyTrack = await searchSpotifyTrack(query);
        let searchQuery = query;
        
        if (spotifyTrack) {
            searchQuery = `${spotifyTrack.name} ${spotifyTrack.artists[0].name}`;
        }

        // Ищем на YouTube
        const ytResults = await play.search(searchQuery, { limit: 1 });
        if (!ytResults || ytResults.length === 0) {
            return interaction.reply('❌ Трек не найден!');
        }

        const video = ytResults[0];
        const stream = await play.stream(video.url);

        // Подключаемся к голосовому каналу
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // Создаем аудио плеер
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        player.play(resource);
        connection.subscribe(player);

        // Сохраняем плеер
        client.players.set(interaction.guild.id, { player, connection });

        // Обработка событий плеера
        player.on(AudioPlayerStatus.Playing, () => {
            console.log('🎵 Воспроизведение началось');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('⏹️ Воспроизведение завершено');
            connection.destroy();
            client.players.delete(interaction.guild.id);
        });

        player.on('error', error => {
            console.error('Ошибка воспроизведения:', error);
            interaction.followUp('❌ Произошла ошибка при воспроизведении!');
        });

        // Создаем красивый embed
        const embed = new EmbedBuilder()
            .setColor('#1DB954')
            .setTitle('🎵 Сейчас играет')
            .setDescription(`**${video.title}**`)
            .setThumbnail(video.thumbnails[0].url)
            .addFields(
                { name: 'Длительность', value: video.durationRaw, inline: true },
                { name: 'Канал', value: video.channel.name, inline: true }
            )
            .setTimestamp();

        if (spotifyTrack) {
            embed.addFields(
                { name: 'Spotify', value: `[Открыть в Spotify](${spotifyTrack.external_urls.spotify})`, inline: true }
            );
        }

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Ошибка воспроизведения:', error);
        await interaction.reply('❌ Произошла ошибка при воспроизведении музыки!');
    }
}

// Обработка сообщений
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'play':
        case 'p':
            if (args.length === 0) {
                return message.reply('❌ Укажите название трека!');
            }
            const query = args.join(' ');
            await playMusic(message, query);
            break;

        case 'stop':
        case 's':
            const playerData = client.players.get(message.guild.id);
            if (playerData) {
                playerData.player.stop();
                playerData.connection.destroy();
                client.players.delete(message.guild.id);
                message.reply('⏹️ Воспроизведение остановлено');
            } else {
                message.reply('❌ Бот не воспроизводит музыку!');
            }
            break;

        case 'pause':
        case 'pause':
            const pausePlayer = client.players.get(message.guild.id);
            if (pausePlayer && pausePlayer.player.state.status === AudioPlayerStatus.Playing) {
                pausePlayer.player.pause();
                message.reply('⏸️ Воспроизведение приостановлено');
            } else {
                message.reply('❌ Нечего приостанавливать!');
            }
            break;

        case 'resume':
        case 'r':
            const resumePlayer = client.players.get(message.guild.id);
            if (resumePlayer && resumePlayer.player.state.status === AudioPlayerStatus.Paused) {
                resumePlayer.player.unpause();
                message.reply('▶️ Воспроизведение возобновлено');
            } else {
                message.reply('❌ Нечего возобновлять!');
            }
            break;

        case 'help':
        case 'h':
            const helpEmbed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle('🎵 Помощь по командам')
                .setDescription('Список доступных команд:')
                .addFields(
                    { name: `${PREFIX}play <трек>`, value: 'Воспроизвести трек', inline: false },
                    { name: `${PREFIX}stop`, value: 'Остановить воспроизведение', inline: false },
                    { name: `${PREFIX}pause`, value: 'Приостановить воспроизведение', inline: false },
                    { name: `${PREFIX}resume`, value: 'Возобновить воспроизведение', inline: false },
                    { name: `${PREFIX}help`, value: 'Показать эту справку', inline: false }
                )
                .setFooter({ text: 'Spotify Discord Bot' });
            message.reply({ embeds: [helpEmbed] });
            break;
    }
});

// Обработка slash команд
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'play':
            const query = interaction.options.getString('query');
            await playMusic(interaction, query);
            break;

        case 'stop':
            const playerData = client.players.get(interaction.guild.id);
            if (playerData) {
                playerData.player.stop();
                playerData.connection.destroy();
                client.players.delete(interaction.guild.id);
                await interaction.reply('⏹️ Воспроизведение остановлено');
            } else {
                await interaction.reply('❌ Бот не воспроизводит музыку!');
            }
            break;
    }
});

// Событие готовности бота
client.on('ready', async () => {
    console.log(`🤖 Бот ${client.user.tag} успешно запущен!`);
    console.log(`📊 Бот работает на ${client.guilds.cache.size} серверах`);
    
    // Получаем Spotify токен
    await getSpotifyToken();
    
    // Обновляем статус бота
    client.user.setActivity('🎵 Spotify Music', { type: 'LISTENING' });
});

// Обработка ошибок
client.on('error', error => {
    console.error('Ошибка Discord клиента:', error);
});

process.on('unhandledRejection', error => {
    console.error('Необработанная ошибка:', error);
});

// Запуск бота
client.login(process.env.DISCORD_TOKEN);
