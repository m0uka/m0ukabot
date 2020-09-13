


exports.run = async (client, message) => {


    if (message.author.bot) return;
    if (message.channel.type == "dm") return; // zkontrolovat jestli to není DM

    var thisConf;

    var sqlQuery = `SELECT * FROM automod WHERE id = '${message.guild.id}'`;
    client.mysql.query(sqlQuery, function (err, result) {
        thisConf = result[0];
        if (!thisConf) return;

        thisConf.blokovanaSlovaArray = JSON.parse(thisConf.blokovanaSlovaArray);


        if (thisConf.inviteBlocker) {
            if (message.content.includes("https://discord.gg/")) {
                message.delete(0);
                message.channel.send(client.createEmbed(":warning: Invite link byl zablokován.", "#edc32a", ""));
                return;
            }
        }


        try {
            if (thisConf.blokovanaSlova && thisConf.blokovanaSlovaArray.some(word => message.content.toLowerCase().includes(word.toLowerCase()))) {
                if (message.content.toLowerCase().includes(thisConf.prefix + "automod blokovanaslova")) return;

                message.delete(0);
                message.channel.send(client.createEmbed(":warning: Zpráva obsahovala zablokované slovo.", "#edc32a", ""))
                    .then(function (message) {
                        message.delete(2000);
                    })


                return;
            }
        }
        catch (err) {
            // placeholder error
        }

    });
}