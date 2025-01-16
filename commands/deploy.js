const CommandBuilder = require("../models/command/CommandBuilder.js");
const logger = require("../lib/logger.js");
const { PermissionFlagsBits } = require('discord.js');
var client;

module.exports = {
    init() {
        client = this.client;
    },
    data: new CommandBuilder()
        .setCommandType(CommandBuilder.MESSAGE_COMMAND)
        .setCommandType(CommandBuilder.BOT_ADMIN_COMMAND)
        .setName("deploy")
        .setDescription("Deploys slash commands globally or for a guild or guilds.")
        .setSyntax("deploy <guild_id>")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(o => o.setName("guild_id").setDescription("The id of the guild; 'global' for global or 'all' for all guilds").setRequired(true)),
    async execute(...argv) {
        if (argv.length == 1) {
            handleInteraction(...argv);
        }
        else throw new Error(`Unrecognized signature!`);
    }
}

async function handleInteraction(interaction) {
    var guilds = [];
    var guildId = interaction.options.getString("guild_id");

    if (!guildId) guildId = interaction.guild?.id;

    if (!guildId) {
        interaction.reply("Error: You must specify a guild id, 'global', or 'all' for this command");
        return;
    }

    if (guildId.toLowerCase() == "global") {
        client.modules.deploy.deployGlobal()
            .then(() => {
                interaction.reply("Succesfully deployed global commands.");
            })
            .catch(err => {
                interaction.reply("There was an error in deploying the global commands: " + err);
            });

        return;
    }
    else if (guildId.toLowerCase() == "all") {
        for (let g of client.guilds.cache.values()) {
            guilds.push(g);
        }
    }
    else {
        var guild = await client.modules.discord.getGuild(guildId);
        if (guild) guilds.push(guild);
        else {
            interaction.reply(`Error: Guild id '${guildId}' is either invalid or not found.`);
            return;
        }
    }

    var errors = [];

    for (let guild of guilds) {
        try {
            await client.modules.deploy.deployToGuild(guild.id);
        }
        catch (err) {
            logger.error("*** Error in deploying to guild '" + guild.name + "': " + err);
            errors.push("Error depoying to guild '" + guild.name + "': " + err);
        }
    }

    if (errors.length > 0) {
        interaction.reply("There were errors while deploying commands:\n" + errors.join("\n"));
    }
    else {
        interaction.reply("Successfully deployed to guilds!");
    }
}