const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    {
        name: 'indexbots',
        description: 'Lists all bots on the server with their descriptions',
    },
    {
        name: 'setdescription',
        description: 'Set a description for a bot',
        options: [
            {
                name: 'bot',
                description: 'The bot to set a description for',
                type: 6, // USER type
                required: true,
            },
            {
                name: 'description',
                description: 'The description to set for the bot',
                type: 3, // STRING type
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
