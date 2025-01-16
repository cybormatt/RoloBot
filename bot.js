const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Create and connect to the SQLite database
const db = new sqlite3.Database('./botDescriptions.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the botDescriptions database.');
});

// Create the bots table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS bots (
    bot_id TEXT PRIMARY KEY,
    bot_name TEXT,
    description TEXT
)`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Command handler for indexing bots
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'indexbots') {
        const bots = interaction.guild.members.cache.filter(member => member.user.bot);
        let descriptionList = '';

        for (const bot of bots.values()) {
            // Get description from DB or use default
            db.get('SELECT description FROM bots WHERE bot_id = ?', [bot.user.id], (err, row) => {
                let description = row ? row.description : 'No description set.';
                descriptionList += `**${bot.user.tag}**: ${description}\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Bot List')
            .setDescription(descriptionList || 'No bots found.')
            .setColor(0x00AE86);

        await interaction.reply({ embeds: [embed] });
    }

    // Command handler for setting bot description
    if (commandName === 'setdescription') {
        const botMention = interaction.options.getUser('bot');
        const description = interaction.options.getString('description');

        if (!botMention || !botMention.bot) {
            return interaction.reply('Please mention a valid bot.');
        }

        // Check if the user has a role to set the description
        const allowedRoles = ['Admin', 'Bot Manager']; // Set your allowed roles here
        if (!interaction.member.roles.cache.some(role => allowedRoles.includes(role.name))) {
            return interaction.reply('You do not have permission to set bot descriptions.');
        }

        // Insert or update the description in the database
        db.run('INSERT OR REPLACE INTO bots (bot_id, bot_name, description) VALUES (?, ?, ?)',
            [botMention.id, botMention.tag, description],
            function (err) {
                if (err) {
                    return console.error(err.message);
                }
                interaction.reply(`Description for ${botMention.tag} updated!`);
            });
    }
});

client.login('YOUR_BOT_TOKEN');
