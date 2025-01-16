const { SlashCommandBuilder } = require("@discordjs/builders");
const { Collection } = require("@discordjs/collection");

module.exports = class extends SlashCommandBuilder {
    static BOT_ADMIN_COMMAND = 1;
    static MESSAGE_COMMAND = 2;
    static INTERNAL_COMMAND = 4;
    static SLASH_COMMAND = 8;
    static WEB_COMMAND = 16;

    category = "";
    enabled = true;
    deleteUserMessage = false;
    isGlobal = false;
    commandType = 0;
    syntax = [];
    permissions = new Collection();

    map() {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
            category: this.category,
            deleUserMessage: this.deleteUserMessage,
            commandType: this.commandType,
            syntax: this.syntax,
            isGlobal: this.isGlobal
        }
    }

    setCategory(val) {
        this.category = val;
        return this;
    }

    setEnabled(val) {
        this.enabled = val;
        return this;
    }

    setGlobal(val) {
        this.isGlobal = val;
        return this;
    }

    setSyntax(str) {
        this.syntax.push(str);
        return this;
    }

    setCommandType(commandType) {
        this.commandType = this.commandType | commandType;
        return this;
    }

    setDeleteUserMessage(val) {
        this.deleteUserMessage = val;
        return this;
    }

    isSlashCommand() {
        return (this.commandType & this.constructor.SLASH_COMMAND) == this.constructor.SLASH_COMMAND;
    }

    isMessageCommand() {
        return (this.commandType & this.constructor.MESSAGE_COMMAND) == this.constructor.MESSAGE_COMMAND;
    }

    isInternalCommand() {
        return (this.commandType & this.constructor.INTERNAL_COMMAND) == this.constructor.INTERNAL_COMMAND;
    }

    isBotAdminCommand() {
        return (this.commandType & this.constructor.BOT_ADMIN_COMMAND) == this.constructor.BOT_ADMIN_COMMAND;
    }

    isWebCommand() {
        return (this.commandType & this.constructor.WEB_COMMAND) == this.constructor.WEB_COMMAND;
    }
}