const logger = require("../lib/logger.js");
const mysql = require("../lib/mysql.js");

const config = require("../config.json");

module.exports = {
    name: "indexbots",
    init() { },
    showBots(interaction) {
        interaction.reply("Hello World!");
    }
}