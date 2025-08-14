const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config({ path: './config.env' });

const commands = [
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Воспроизвести трек из Spotify или YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Название трека или ссылка')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Остановить воспроизведение музыки'),
    
    new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Приостановить воспроизведение'),
    
    new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Возобновить воспроизведение'),
    
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Показать справку по командам')
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🔄 Начинаю регистрацию slash команд...');

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_TOKEN.split('.')[0]),
            { body: commands },
        );

        console.log('✅ Slash команды успешно зарегистрированы!');
    } catch (error) {
        console.error('❌ Ошибка при регистрации команд:', error);
    }
})();
