// Příkaz na purge
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = async (client, message, args) => {

    var messageCount = args[0];

    if (!messageCount) return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Zadej počet zpráv.."));
    

    var thisConf;
    var settingsQuery = "SELECT * FROM settings WHERE id = " + message.guild.id;

    if (messageCount < 1) return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Číslo musí být větší než 0"));

    client.mysql.query(settingsQuery, async function (err, result) {
        thisConf = result[0];

        const modRole = await message.guild.roles.find("name", thisConf.modRole);


        if (await client.checkPermission(message.member) == false) {
            if (!modRole) {
                message.channel.send(":warning: Upozornění", "#dff442", "Moderátorská role nenalezena.. Doporučujeme ji nastavit..")
                    .then(msg => msg.delete());
            } else {
                if (await message.member.roles.has(modRole.id) == false) {
                    return message.channel.send(client.createEmbed(":x: Nemáš právo použít tento příkaz (potřebuješ alespoň moderátorskou roli, nebo oprávnění Administrátor)", "#ff0000", ""));
                }
            }
        }

        message.channel.bulkDelete(messageCount)
        .then(messages => {
            message.channel.send(client.createEmbed(':white_check_mark: Úspěch!', '#50f442', `Úspěšně vymazáno ${messages.size} zpráv.`))
            .then(msg => msg.delete(5000));
        })
        .catch(err => {
            console.error(err);
            if (err.code == 50034) { // nelze smazat zprávy staré více než 14 dní
                return message.channel.send(client.createEmbed(':x: Chyba', '#ff0000', `Nelze smazat zprávy starší než 14 dní..`));
            }
            message.channel.send(client.createEmbed(':x: Chyba', '#ff0000', `Nepodařilo se smazat zprávy..`));
        });

    });

}

exports.conf = {
    enabled: true,
    aliases: ["purge"],
};

exports.help = {
    name: "smazat",
    category: "System",
    description: "Smaž zprávy v text channelu",
    usage: "smazat [počet zpráv]"
};