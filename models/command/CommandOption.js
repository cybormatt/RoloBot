const CommandOptionType = require("./CommandOptionType.js");
const utils = require("../../lib/utils.js");

/* 
This purpose of this class is to wrap values that can be either primitive or objects, provide 
meta-data for that value, and to convert the value to it's appropriate data type.  Meta-data
is collected from the Option object passed into the constructor.  Member, role, mentionable,
and channel objects are created from user input, specified in angle-bracket format or by the 
id alone.
*/
exports.CommandOption = class {
    __opt;
    __client;
    __guild;

    name;
    type;
    __value;
    get value() {
        return this.__value;
    }

    options;

    user;
    member;
    channel;
    role;

    async setValue(value) {
        if (this.type == undefined && this.__opt.options) {
            this.__value = value;
            this.options = this.__opt.options;
            return;
        }

        switch (this.type) {
            case CommandOptionType.Subcommand:
            case CommandOptionType.SubcommandGroup:
                break;
            case CommandOptionType.String:
                this.__value = value;
                break;
            case CommandOptionType.Integer:
            case CommandOptionType.Number:
                var val;

                if (this.type == CommandOptionType.Integer) val = parseInt(value);
                else val = parseFloat(value);

                if (isNaN(val)) throw new Error(`Value given for option ${this.name} is not a number!`);
                else this.__value = val;

                break;
            case CommandOptionType.Boolean:
                var bool = utils.parseBoolean(value);
                if (bool == undefined) throw new Error(`Invalid boolean value given for option ${this.name}!`);
                this.__value = bool;
                break;
            case CommandOptionType.User:
                await this.__processUser(value);
                break;
            case CommandOptionType.Channel:
                await this.__processChannel(value);
                break;
            case CommandOptionType.Role:
                await this.__processRole(value);
                break;
            case CommandOptionType.Mentionable:
                await this.__processMentionable(value);
                break;
            default:
                throw new Error("Unknown option type!");
        }
    }

    async __processUser(value) {
        var match = value.match(/(<@(!|&)?)?([0-9]{18})($|>$)/);
        if (match) {
            var id = match[3];
            this.__value = id;

            if (this.__guild) {
                var member;
                try {
                    member = await this.__guild.members.fetch({ user: id, force: true });

                    if (member) {
                        this.member = member;
                    }
                }
                catch (err) {
                    if (!err.message.match(/Unknown (Member|User)/i)) {
                        throw err;
                    }
                }
            }

            var user;
            try {
                user = await this.__client.users.fetch(id, { force: true });
                this.user = user;
            }
            catch (err) {
                if (err.message.match(/Unknown User/i)) {
                    throw new Error(`Could not find user with id ${id} for option ${this.name}!`);
                }
                else throw err;
            }
        }
        else throw new Error(`Invalid user input for option ${this.name}!`);
    }

    async __processChannel(value) {
        var match = value.match(/(<#)?([0-9]{18})($|>$)/);
        if (match) {
            var id = match[2];
            var channel = await this.__guild.channels.fetch(id);

            if (channel) {
                this.__value = id;
                this.channel = channel;
            }
            else {
                throw new Error(`Could not find channel with id ${id} for option ${this.name}!`);
            }
        }
        else {
            var tmp = ((value[0] == "#") ? value.slice(1) : value).toLowerCase();
            var channel;

            await this.__guild.channels.fetch();
            for (let c of this.__guild.channels.cache.values()) {
                if (c.type != "GUILD_VOICE" && c.type != "GUILD_STAGE_VOICE") continue;
                if (c.name.toLowerCase() == tmp) {
                    channel = c;
                    break;
                }
            }

            if (!channel) throw new Error(`Invalid channel input for option ${this.name}!`);

            this.__value = channel.id;
            this.channel = channel;
        }
    }

    async __processRole(value) {
        var match = value.match(/(<@&)?([0-9]{18})($|>$)/);
        if (match) {
            var id = match[2];
            var role = await this.__guild.roles.fetch(id);

            if (role) {
                this.__value = id;
                this.role = role;
            }
            else {
                throw new Error(`Could not find role with id ${id} for option ${this.name}`);
            }
        }
        else throw new Error(`Invalid role input for option ${this.name}`);
    }

    async __processMentionable(value) {
        var match = value.match(/(<@(!|&)?)?([0-9]{18})($|>$)/);
        if (match) {
            var role = await this.__guild.roles.fetch(id);
            if (role) {
                this.__value = id;
                this.role = role;
            }
            else {
                var member = await this.__guild.members.fetch(id);
                if (member) {
                    this.__value = id;
                    this.user = member.user;
                    this.member = member;
                }
                else {
                    var user = await this.__client.users.fetch(id);
                    if (!user) throw new Error(`Could not find user or role with id ${id} for option ${this.name}!`);

                    this.__value = id;
                    this.user = user;
                }
            }
        }
        else throw new Error(`Invalid mentionable input for option ${this.name}!`);
    }

    constructor(client, guild, commandOption) {
        this.__client = client;
        this.__guild = guild;
        this.__opt = commandOption;
        this.name = commandOption.name;
        this.type = commandOption.type;
    }
}