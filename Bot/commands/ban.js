// Ban příkaz
const Discord = require('discord.js');
const config = require('../config.json');

var moment = require('moment-timezone');


exports.run = async (client, message, [mention, time, ...reason]) => {
    var thisConf;
    var settingsQuery = "SELECT * FROM settings WHERE id = " + message.guild.id;
    client.mysql.query(settingsQuery, async function (err, result) {
        thisConf = result[0];
        const prefix = thisConf.prefix;

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
            return message.channel.send(client.createEmbed(":x: Prosím specifikuj koho chceš zabanovat - použití: ```" + prefix + "ban @uživatel [čas] (důvod)" + "```", "#ff0000", ""));

        if (!await client.botHasPermission(message, "BAN_MEMBERS"))
            return message.channel.send(client.createEmbed(":x: Nemám oprávnění pro vyhazování uživatelů! Doporučuji mi nastavit **`ADMINISTRATOR`** roli.", "#ff0000", ""));


        const banMember = message.mentions.members.first();

        var durationModifier = time.replace(/[0-9]/g, '');
        var duration = '';

        var banTime = moment().tz('Europe/Prague');
        var banLength = time.replace(/\D/g, "");
        var banExpiry;

        switch (durationModifier) {
            case 'min':
            case 'minut':
            case 'minuta':
            case 'minuty':
            case 'm':
                banExpiry = moment(banTime).add(banLength, 'minutes');
                break;

            case 'h':
            case 'hodin':
            case 'hodina':
            case 'hod':
                banExpiry = moment(banTime).add(banLength, 'hours');
                break;

            case 'd':
            case 'dní':
            case 'dni':
            case 'den':
                banExpiry = moment(banTime).add(banLength, 'days');
                break;

            case 'mesicu':
            case 'M':
            case 'měsíců':
            case 'mesic':
            case 'měsíc':
                banExpiry = moment(banTime).add(banLength, 'months');
            break;

            case 'perma':
                banExpiry = moment(banTime).add(9999, 'years');
            break;

            default:
                return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Prosím použij časový příkaz v tomto formátu: ```!ban @uživatel [(číslo)dní (d)/hodin (h)/minut (m)/měsíců (M)/PERMA] (důvod)\n```Příklad: ```!ban @m0uka 2d Nerespektování pravidel```"));
                break;

        }

        reason = reason.join(" ");

        if (!reason)
            reason = "Nespecifikován";







        try {
            moment.locale('cs');
            await banMember.send(client.createEmbed(":x: Ban", "#ffd70f", "Byl jsi zabanován na serveru **" + message.guild.name + "**.\nDůvod: **" + reason + "**\nBan vyprší: **" + moment(banExpiry).locale('cs').format('LLL') + "**"));
        }
        catch (err) {
            console.log(err);
            // nemohl doručit zprávu (bot nebo zablokovaný uživatel)
        }
        banMember.ban(reason)
            .then(member => {
                client.ensureBan(message.guild, message.author, banTime.unix(), banExpiry.unix(), reason);


                message.channel.send(client.createEmbed(`${member.user.username} byl úspěšně zabanován.`, "#50f442", ""));

            })
            .catch(err => {
                // uživatel který má být vyhozen má nejspíš vyšší privilege (zkontrolujeme si)
                if (err.message == "Privilege is too low...") {
                    return message.channel.send(client.createEmbed(":x: Tento uživatel má vyšší oprávnění než já, proto ho nemůžu vyhodit", "#ff0000", ""));
                } else {
                    return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Nastala chyba v banování: " + err.message));
                }
            })

    });
}

exports.conf = {
    enabled: true, // POZOR: VYPNUTO, PRO ZAPNUTÍ NASTAV NA TRUE /////////////////
    aliases: [],
};

exports.help = {
    name: "ban",
    category: "Správa serveru",
    description: "Zabanování uživatele",
    usage: "ban [@uživatel] [doba {d=den, h=hodin, m=minut, M=měsíců}] [důvod]"
};