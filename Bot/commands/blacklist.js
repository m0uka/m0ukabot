
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = async (client, message, args) => {



    const user = message.mentions.users.first();
    if (!user) return message.channel.send(client.createEmbed(":x: Nespecifikoval jsi uživatele!", "#ff0000", ""));

    

    const regex_m = /\<[^\b\s]+/g; // removes mentions
    const regex_w = /s^\s+|\s+$|\s+(?=\s)/g; // remove duplicate and trailing spaces
    var content = args.join(" ").replace(regex_m, '').replace(regex_w, '').trim();

    args = content.split(" ");

    const green = client.emojis.find("name", "greenInfo");
    const red = client.emojis.find("name", "redInfo");


    if (!args[0]) {
        
        
        client.mysql.query("SELECT * FROM blacklist WHERE id = " + user.id, function (err, result) {
        if (err) throw err;
        var blackListConf = result[0];

        var globalStatus = green;
        var reportStatus = green;
        var localStatus = green;
        var globalStatusWord = "NE";
        var reportStatusWord = "NE";
        var localStatusWord = "NE";
        if (blackListConf != null) {
            if (blackListConf.commandBlacklist) {
                // global ban
                globalStatus = red;
                globalStatusWord = "ANO";
            }
            if (blackListConf.reportBlackList) {
                reportStatus = red;
                reportStatusWord = "ANO";
            }
            if (blackListConf.guildsBlocked.includes(message.guild.id)) {
                localStatus = red;
                localStatusWord = "ANO";
            }

        }

        return message.channel.send(client.createEmbed(`Blacklisty pro uživatele ${user.username}`, "#4286f4", `${globalStatus} Globální: **${globalStatusWord}**\n${reportStatus} Nahlašování bugů: **${reportStatusWord}**\n${localStatus} Lokální: **${localStatusWord}**`));

        })

    }

    switch (args[0].toLowerCase()) {

        case 'přidat':
        case 'pridat':
        case 'odebrat':
        default:
            client.mysql.query("SELECT * FROM blacklist WHERE id = " + user.id, function (err, result) {
            var thisGuild = result[0];

            if (args[2] && args[2].toLowerCase() == "global" && message.author.id != config.ownerid) return message.channel.send(client.createEmbed(":x: Globální bany může udělovat jen majitel bota!", "#ff0000", ""));
            if (!await client.checkPermission(message.member)) return client.notEnoughPermissions(message, thisGuild.adminRole);



            client.blacklist.ensure(user.id, {
                time: [0],
                guildsBlocked: [],
                commandBlacklist: false,
                reportBlackList: false,
            });


            if (args[0].toLowerCase() == "přidat" || args[0].toLowerCase() == "pridat") {
                const globalBlacklist = await client.blacklist.get(user.id, "commandBlacklist");
                const localBlacklist = await client.blacklist.get(user.id, "guildsBlocked")

                


                if (args[1] && args[1].toLowerCase() == "global") {
                    if (!globalBlacklist) {
                        client.blacklist.set(user.id, true, "commandBlacklist");
                        message.channel.send(client.createEmbed(":white_check_mark: Uživatel " + user.username + " byl přidán úspěšně. (GLOBAL)", "#a7f442", ""));
                    } else {
                        return message.channel.send(client.createEmbed(":x: Tento uživatel již je v blacklistu!", "#ff0000", ""));
                    }

                }

                  else {

                    if (!localBlacklist.includes(user.id)) {
                        client.blacklist.push(user.id, message.member.guild.id, "guildsBlocked")
                        message.channel.send(client.createEmbed(":white_check_mark: Uživatel " + user.username + " byl přidán úspěšně.", "#a7f442", ""));
                    } else {
                        return message.channel.send(client.createEmbed(":x: Tento uživatel již je v blacklistu!", "#ff0000", ""));
                    }
                }
            }

            if (args[0].toLowerCase() == "odebrat") {
                const globalBlacklist = client.blacklist.get(user.id, "commandBlacklist");
                const localBlacklist = client.blacklist.get(user.id, "guildsBlocked");

                if (localBlacklist.length < 0 && !globalBlacklist) {
                    return message.channel.send(client.createEmbed(":x: Tento uživatel není v blacklistu!", "#ff0000", ""));
                }
                else {
                    if (args[1] && args[1].toLowerCase() == "global") {
                        if (globalBlacklist) {
                            client.blacklist.set(user.id, false, "commandBlacklist")
                            message.channel.send(client.createEmbed(":white_check_mark: Uživatel " + user.username + " byl odebrán úspěšně. (GLOBAL)", "#a7f442", ""));
                        } else {
                            return message.channel.send(client.createEmbed(":x: Tento uživatel není v blacklistu!", "#ff0000", ""));
                        }
                    } else {
                        var index = localBlacklist.indexOf(message.member.guild.id);
                        if (index > -1) {
                            client.blacklist.remove(user.id, message.member.guild.id, "guildsBlocked");
                            message.channel.send(client.createEmbed(":white_check_mark: Uživatel " + user.username + " byl odebrán úspěšně.", "#a7f442", ""));
                        } else {
                            return message.channel.send(client.createEmbed(":x: Tento uživatel není v blacklistu!", "#ff0000", ""));
                        }
                    }
                }
            }

        })
            break;

        case 'report':
        case 'bugreport':
            if (message.author.id != config.ownerid) return message.channel.send(client.createEmbed(":x: Blacklistovat bug reporty může pouze majitel bota.", "#ff0000", ""));


            if (!args[1]) {
                var blacklist = client.blacklist.get(user.id);

                if (blacklist == null) return message.channel.send(client.createEmbed(`${green} Uživatel ` + user.username + ` není v blacklistu.`, "#53db4e", ""));

                if (blacklist.reportBlackList) {
                    message.channel.send(client.createEmbed(`${red} Uživatel ` + user.username + ` je v blacklistu.`, "#ff0000", ""));
                } else {
                    message.channel.send(client.createEmbed(`${green} Uživatel ` + user.username + ` není v blacklistu.`, "#53db4e", ""));
                }
                return;
            }

            if (args[1].toLowerCase() == "přidat" || args[1].toLowerCase() == "pridat") {
                console.log("přidat");
                client.addToReportBlackList(user.id)
                    .then(function () {
                        message.channel.send(client.createEmbed("Uživatel " + user.username + " byl úspěšně přidán do report blacklistu.", "#48f442", ""));
                    })
                    .catch(function (err) {
                        message.channel.send(client.createEmbed(":x: Nastala chyba", "#ff0000", err.message));
                    });
            }
            if (args[1].toLowerCase() == "odebrat") {
                client.removeFromReportBlackList(user.id)
                    .then(function () {
                        message.channel.send(client.createEmbed("Uživatel " + user.username + " byl úspěšně odebrán z report blacklistu.", "#48f442", ""));
                    })
                    .catch(function (err) {
                        message.channel.send(client.createEmbed(":x: Nastala chyba", "#ff0000", err.message));
                    });
            }
            break;
    }
}

exports.conf = {
    enabled: true,
    aliases: [],
};

exports.help = {
    name: "blacklist",
    category: "Správa serveru",
    description: "Nastav blacklist (zakázání příkazů pro uživatele)",
    usage: "blacklist [@uživatel] (global)"
};