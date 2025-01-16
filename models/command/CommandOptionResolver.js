/*
This class module is responsible for finding the arguments within the message content, 
creating CommandOption objects for each argument, and handling the requests for each
argument.
*/
const { Message } = require('discord.js');
const CommandOption = require("./CommandOption.js");
const CommandOptionType = require("./CommandOptionType.js");

module.exports = class {
    client;
    guild;

    command;
    subcommand;
    __origArgs;
    __remainingArgs;
    args;

    initialized = false;

    getSubcommand() {
        if (!this.initialized) throw new Error("Object not initialized!");
        return this.subcommand?.name;
    }

    get(name) {
        if (!this.initialized) throw new Error("Object not initialized!");
        return this.args.find(a => a.name == name);
    }

    getString(name) {
        return this.get(name)?.value;
    }

    getInteger(name) {
        return this.get(name)?.value;
    }

    getNumber(name) {
        return this.get(name)?.value;
    }

    getBoolean(name) {
        return this.get(name)?.value;
    }

    getUser(name) {
        return this.get(name)?.user;
    }

    getMember(name) {
        return this.get(name)?.member;
    }

    getRole(name) {
        return this.get(name)?.role;
    }

    getChannel(name) {
        return this.get(name)?.channel;
    }

    getMentionable(name) {
        var tmp;
        if (tmp = this.get(name)?.role) return tmp;
        else if (tmp = this.get(name)?.member) return tmp;
        else if (tmp = this.get(name)?.user) return tmp;
        else return;
    }

    async initialize() {
        var match = this.__matchArgs();
        var opts;
        /* HACK: For some reason, the sub-command option objects have an undefined type.
           So we determine it is a sub-command option by checking if the options property is
           not null. We will also check the type properly for future updates to API */
        if (this.command.options.find(o => (o.type == undefined && o.options) || o.type == CommandOptionType.Subcommand)) {
            if (!match) throw new Error(`You must provide a sub-command for this command!`)

            for (let o of this.command.options) {
                if (!((o.type == undefined && o.options) || o.type == CommandOptionType.Subcommand)) continue;

                var val = (match[4] ? ((match[3] != "/") ? match[4] : match[2]) : match[2]).toLowerCase();
                if (o.name.toLowerCase() == val) {
                    var arg = new CommandOption(this.client, this.guild, o);
                    await arg.setValue(val);

                    this.subcommand = arg;
                    this.__shift(match[0]);
                }
            }

            if (!this.subcommand) throw new Error(`Sub-command ${val} not found!`);

            opts = this.subcommand.options;
        }
        else {
            opts = this.command.options;
        }

        while (match = this.__matchArgs()) {
            var commandOption;
            var name = (match[1]) ? match[1].slice(0, match[1].indexOf("=")) : "";
            var val = match[4] ? ((match[3] != "/") ? match[4] : match[2]) : match[2];

            if (name) {
                for (let o of opts) {
                    var tmp = name.toLowerCase();
                    if (o.name.toLowerCase() == tmp) {
                        commandOption = o;
                        break;
                    }
                }

                if (!commandOption) throw new Error(`Can not find option with name ${name}!`);
            }
            else {
                var n = this.args.length;
                commandOption = opts[n];
                if (!commandOption) throw new Error(`You have entered one or more values past the command's parameter count.  Make sure you have string values within quotes.  Value: ${val}`);

                // TODO: Implement the following code.  It's purpose is to assuming the trailing
                //       end of args is one string.
                //if (!commandOption) {
                //    commandOption = opts[n - 1];
                //    if (commandOption.type == CommandOptionType.String) {
                //        var arg = this.args[n - 1];
                //        var val = arg.value + " " + this.__remainingArgs;
                //        arg.setValue(val);
                //        break;
                //    }
                //    else throw new Error(`You have entered one or more values past the command's parameter count.  Value: ${val}`);
                //}

                name = commandOption.name;
            }

            var arg = new CommandOption(this.client, this.guild, commandOption);
            await arg.setValue(val);

            this.args.push(arg);
            this.__shift(match[0]);
        }

        this.initialized = true;
    }

    __matchArgs() {
        // This option pattern will match the following formats of options:
        //   key1=any-string-of-chars-w/o-spaces key2="A quoted string with spaces" key3='Another quoted string'
        //   any-string-of-chars-w/o-spaces      "A quoted string with spaces"      'Another quoted string'
        //   "A 'quoted string' inside another"  'A "quoted string" inside another'
        //   "An \"escaped quotation\" within a quote"  'An \'escaped quotation\' within a quote'
        //   /A regular expression/
        return this.__remainingArgs.match(/([a-zA-Z0-9_]* *= *)?(("|'|\/)((.|\r|\n)*?[^\\])\3|([^ ]+))/m);
    }

    __shift(str) {
        var pos = str.length + this.__remainingArgs.toLowerCase().indexOf(str.toLowerCase());

        var i = pos + 1;
        while (this.__remainingArgs[i] == ' ') i++;
        this.__remainingArgs = this.__remainingArgs.slice(i);
    }

    constructor(command, args) {
        if (args instanceof Message) {
            var len = command.data.name.length + args.content.indexOf(command.data.name);
            this.__origArgs = args.content.slice(len + 1);
        }
        else {
            throw new Error(`Invalid arg data for command ${command.data.name}!`);
        }

        this.guild = args.guild;
        this.client = args.client;
        this.command = command.data;
        this.args = [];
        this.__remainingArgs = this.__origArgs;
    }
}