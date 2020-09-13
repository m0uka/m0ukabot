// Kick příkaz
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = async (client, message, [mention, ...reason]) => {
    const thisConf = await client.settings.get(message.guild.id);
    const prefix = thisConf.prefix;

    const confModRole = thisConf.modRole;
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

    if (message.mentions.members.size === 0)
        return message.channel.send(client.createEmbed(":x: Prosím specifikuj koho chceš vyhodit - použití: ```" + prefix + "kick @uživatel (důvod)" + "```", "#ff0000", ""));

    if (!await client.botHasPermission(message, "KICK_MEMBERS"))
        return message.channel.send(client.createEmbed(":x: Nemám oprávnění pro vyhazování uživatelů! Doporučuji mi nastavit **`ADMINISTRATOR`** roli.", "#ff0000", ""));


    const kickMember = message.mentions.members.first();

    if (!reason)
        reason = ["Nespecifikováno"];

    try {
        await kickMember.send(client.createEmbed(":warning: Byl jsi vyhozen ze serveru " + kickMember.guild.name + ", z důvodu " + reason.join(" "), "#ffd70f", ""));
    }
    catch (err) {
        // nemohl doručit zprávu (bot nebo zablokovaný uživatel)
    }
    kickMember.kick(reason.join(" "))
        .then(member => {
            message.channel.send(client.createEmbed(`${member.user.username} byl úspěšně vyhozen.`, "#50f442", ""));
        })
        .catch(err => {
            // uživatel který má být vyhozen má nejspíš vyšší privilege (zkontrolujeme si)
            if (err.message == "Privilege is too low...")
                return message.channel.send(client.createEmbed(":x: Tento uživatel má vyšší oprávnění než já, proto ho nemůžu vyhodit", "#ff0000", ""));
        })


}

exports.conf = {
    enabled: true,
    aliases: ["vyhodit"],
};

exports.help = {
    name: "kick",
    category: "Správa serveru",
    description: "Vyhození uživatele",
    usage: "kick [@uživatel] [důvod]"
};