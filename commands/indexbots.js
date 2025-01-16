const CommandBuilder = require("../models/command/CommandBuilder.js");
const logger = require("../lib/logger.js");
const { PermissionFlagsBits } = require('discord.js');

var client;

module.exports = {
    init() {
        client = this.client;
    },
    data: new CommandBuilder()
        .setGlobal(false)
        .setCommandType(CommandBuilder.SLASH_COMMAND)
        .setCommandType(CommandBuilder.MESSAGE_COMMAND)
        .setName("indexbots")
        .setDescription("Lists all bots on the server with their descriptions")
        .setSyntax("indexbots")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        client.modules.indexbots.showBots(interaction);
    }
}