// Softban příkaz
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = async (client, message, [mention, ...reason]) => {
    var SQLQuery = "SELECT * FROM settings WHERE id = " + message.guild.id;
    client.mysql.query(SQLQuery, async function (err, result) {
        if (err) throw err;

        var thisConf = result[0];
        const prefix = thisConf.prefix;

        const confModRole = thisConf.modRole;
        const modRole = await message.guild.roles.find("name", thisConf.modRole);
        if (!modRole)
            return message.channel.send(client.createEmbed(":x: Mod role neexistuje. Nastav mod roli pomocí ```" + prefix + "nastaveni modRole (jméno role)```", "#ff0000", ""));

        if ((await message.member.roles.has(modRole.id) == false && await client.checkPermission(message.member) == false)) {

            return message.channel.send(client.createEmbed(":x: Nemáš právo použít tento příkaz (potřebuješ Moderátorskou roli)", "#ff0000", ""));
        }

        if (message.mentions.members.size === 0)
            return message.channel.send(client.createEmbed(":x: Prosím specifikuj koho chceš softbanovat - použití: ```" + prefix + "kick @uživatel (důvod)" + "```", "#ff0000", ""));

        if (!await client.botHasPermission(message, "BAN_MEMBERS"))
            return message.channel.send(client.createEmbed(":x: Nemám oprávnění pro softbanování uživatelů! Doporučuji mi nastavit **`ADMINISTRATOR`** roli.", "#ff0000", ""));


        const banMember = message.mentions.members.first();

        if (!reason)
            reason = ["Nespecifikováno"];

        try {
            await banMember.send(client.createEmbed(":warning: Byl jsi softbanován (vyhozen) ze serveru " + banMember.guild.name + ", z důvodu " + reason.join(" "), "#ffd70f", ""));
        }
        catch (err) {
            // nemohl doručit zprávu (bot nebo zablokovaný uživatel)
        }
        await banMember.ban(7, reason.join(" "))
            .then(async member => {
                await message.guild.unban(member);
                message.channel.send(client.createEmbed(`${member.user.username} byl úspěšně softbanován.`, "#50f442", ""));
            })
            .catch(err => {
                // uživatel který má být softbanován má nejspíš vyšší privilege (zkontrolujeme si)
                if (err.message == "Privilege is too low...")
                    return message.channel.send(client.createEmbed(":x: Tento uživatel má vyšší oprávnění než já, proto ho nemůžu softbanovat", "#ff0000", ""));
            })
    })


}

exports.conf = {
    enabled: true,
    aliases: ["sban"],
};

exports.help = {
    name: "softban",
    category: "Správa serveru",
    description: "Softban uživatele (kickne a vymaže 7 dní jeho zpráv)",
    usage: "softban [@uživatel] [důvod]"
};