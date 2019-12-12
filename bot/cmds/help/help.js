const { perms, normal, error } = require('../../utils.js');
const discord = require('discord.js');
const config = require('../../config');

ex = {
	name: 'help',
	description: 'Zeigt alle Commands oder auch nur einen',
	aliases: ['commands', 'cmds'],
    usage: '[command name]',
	args: false,
    cooldown: 1,
    guildOnly: true,
	perms: perms.USER,
    async execute(bot, msg, args) {

        let embed;

        if (args.length > 1) {

            embed = error(bot, msg).setTitle("Fehler").setDescription("Benutzung: " + config.prefix + ex.name + " " + ex.usage)

        } else if(args[0]) {

            const name = args[0].toLowerCase();
            const command = bot.commands.get(name) || bot.commands.find(c => c.aliases && c.aliases.includes(name));

            if(!command){

                embed = error(bot, msg).setTitle("Fehler") .setDescription("Der Command: " + args[0] + " konnte nicht gefunden werden.");

            } else {

                embed = normal(bot, msg).setTitle(`**${command.name}s Beschreibung**`)
                .addField(`**Name:**`, command.name, true);
                if (command.aliases) embed.addField('**Aliases:**', command.aliases.join(', '), true);
                if (command.description) embed.addField('**Beschreibung:**', command.description);
                if (command.usage) embed.addField('**Verwendung:**', config.prefix + command.name + " " + command.usage);
                if (command.cooldown) embed.addField('**Cooldown:**', command.cooldown || 3 + 'Sekunde(n)');
                if (command.guildOnly) embed.addField('**Nur für Server**', "Ja, du hast richtig gehört.");

            }
                
        } else if (!args[0]) {

            embed = normal(bot, msg).setTitle("Alle Commands");
            let _data = [];

            // TODO: BETTER SOLUTION
            for ( const cats of bot.categories ) {
                _data = [];
                for ( const cd of bot.commands ) {
                    const cmd = bot.commands.find(c => c.name == cd[0] && c.category == cats);
                    if(cmd){
                        if(!_data.includes(cmd.name)) {
                            _data.push(cmd.name, cmd.aliases ? " - " + cmd.aliases.join(', ') + '\n' : "\n");
                        }
                    }
                }
                if(_data.length == 0) _data.push("Hier ist nichts");
                embed.addField(`**${cats}**`, _data.join(' '), true);
            }
        }

        msg.channel.send(embed);
    }
};
        

module.exports = ex;