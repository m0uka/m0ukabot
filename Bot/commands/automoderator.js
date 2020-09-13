
// Automoderátor příkaz
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = async (client, message, args) => {

    if (!args[0])
        return message.channel.send(client.createEmbed("Musíš specifikovát vlastnost! Vlastnosti: ``inviteBlocker, blokovanaSlova``", "#6eed29", ""))


    await client.ensureAutomod(message.guild);

    var thisSettings;
    var thisConf;

    var settingsQuery = "SELECT prefix, modRole FROM settings WHERE id = " + message.guild.id;
    client.mysql.query(settingsQuery, async function (err, result) {
        thisSettings = result[0];

        var automodQuery = "SELECT * FROM automod WHERE id = " + message.guild.id;
        client.mysql.query(automodQuery, async function (err, result) {
            thisConf = result[0];
            thisConf.blokovanaSlovaArray = JSON.parse(thisConf.blokovanaSlovaArray);

            if (!thisConf.blokovanaSlovaArray) thisConf.blokovanaSlovaArray = [];


            var modRole = await message.guild.roles.find("name", thisSettings.modRole);

            if (!modRole)
                return message.channel.send(client.createEmbed(":x: Mod role neexistuje. Nastav mod roli pomocí ```" + thisSettings.prefix + "nastaveni modRole (jméno role)```", "#ff0000", ""));


            if ((await message.member.roles.has(modRole.id) == false && await client.checkPermission(message.member) == false)) {

                return message.channel.send(client.createEmbed(":x: Nemáš právo použít tento příkaz (potřebuješ Moderátorskou roli)", "#ff0000", ""));
            }


            let selection = args[0];
            let selectionDisplay;
            switch (selection.toLowerCase()) {
                case "inviteblocker":
                    selectionDisplay = "Invite Blocker";
                    selection = "inviteBlocker";
                    break;

                case "blokovanaslova":
                    if (args[1] == "pridat" || args[1] == "přidat") {

                        if (thisConf.blokovanaSlovaArray.includes(args[2])) return message.channel.send(client.createEmbed(":x: Toto slovo už je v listu blokovaných slov!", "#ff0000", ""));
                        thisConf.blokovanaSlovaArray.push(args[2]);
                        message.channel.send(client.createEmbed(":white_check_mark: Slovo " + args[2] + " bylo úspešně přidáno.", "#42f44b", ""));
                        var setAutomodQuery = `UPDATE automod SET blokovanaSlovaArray = '${JSON.stringify(thisConf.blokovanaSlovaArray)}' WHERE id = '${message.guild.id}'`;
                        client.mysql.query(setAutomodQuery, function (err, result) {
                            if (err) throw err;
                        });
                        return;
                    }
                    if (args[1] == "odebrat" || args[1] == "vymazat" || args[1] == "odstranit") {
                        let index = thisConf.blokovanaSlovaArray.indexOf(args[2]);
                        if (index > -1) {
                            thisConf.blokovanaSlovaArray.splice(index, 1);
                            message.channel.send(client.createEmbed(":white_check_mark: Slovo " + args[2] + " bylo úspešně odebráno.", "#ff0000", ""));
                        } else {
                            return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Zadané slovo není v blokovaných slovech."));
                        }
                        var setAutomodQuery = `UPDATE automod SET blokovanaSlovaArray = '${JSON.stringify(thisConf.blokovanaSlovaArray)}' WHERE id = '${message.guild.id}'`;
                        client.mysql.query(setAutomodQuery, function (err, result) {
                            if (err) throw err;
                        });
                        return;
                    }
                    selectionDisplay = "Blokovaná slova";
                    selection = "blokovanaSlova";
                    break;

                default:
                    return message.channel.send(client.createEmbed(":x: Tato vlastnost neexistuje. Vlastnosti: ``inviteBlocker, blokovanaSlova``", "#ff0000", ""));
                    break;
            }




            if (!args[1]) {
                let cond;
                if (thisConf[selection] == 1) {
                    cond = "Zapnuto"
                } else if (thisConf[selection] == null) {
                    cond = "Nenastaven";
                } else {
                    cond = "Vypnuto";
                }
                if (selection !== "blokovanaSlova") {
                    message.channel.send(client.createEmbed(selectionDisplay + ": " + cond, "#42f442", "Zapni/vypni pomocí `!automod blokovanaSlova zapnout/vypnout`"));
                } else {
                    var blokovanaSlova = thisConf.blokovanaSlovaArray.join(", ");
                    if (thisConf.blokovanaSlovaArray.length < 1) blokovanaSlova = "Nenastaveno";
                    message.channel.send(client.createEmbed(selectionDisplay + ": " + cond, "#42f442", "Slova: `" + blokovanaSlova + "`" + "\n---\nZapni/vypni pomocí `!automod blokovanaSlova zapnout/vypnout`"));
                }
            } else {
                let cond;
                if (args[1].toLowerCase() == "zapnuto" || args[1].toLowerCase() == "zapnout") {
                    thisConf[selection] = true;
                    cond = "zapnutý";
                } else if (args[1].toLowerCase() == "vypnout" || args[1].toLowerCase() == "vypnuto") {
                    thisConf[selection] = false;
                    cond = "vypnutý";
                }
                message.channel.send(client.createEmbed(":white_check_mark: " + selectionDisplay + " je nyní " + cond, "#4286f4", ""))
            }

            var setAutomodQuery = `UPDATE automod SET blokovanaSlova = ${thisConf.blokovanaSlova}, inviteBlocker = ${thisConf.inviteBlocker} WHERE id = '${message.guild.id}'`;
            client.mysql.query(setAutomodQuery, function (err, result) {
                if (err) throw err;
            });
            return;


        });
    });
}

exports.conf = {
    enabled: true,
    aliases: ["automod", "automoderátor", "amod", "moderator"],
};

exports.help = {
    name: "automoderator",
    category: "Správa serveru",
    description: "Nastavení automoderátora",
    usage: "automoderator [vlastnost] [argumenty]"
};