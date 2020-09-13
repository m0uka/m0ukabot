const Discord = require('discord.js');
const config = require('../config.json');

// Initializace konfigurací



exports.run = (client, guild) => {


     var insertQuery = `INSERT INTO settings (id) VALUES ('${guild.id}')`;
     client.mysql.query(insertQuery, function (err, result)
     {
        if (err) throw err;
        console.log("QUERY COMPLETED");
     });

     client.consoleLog(`[Systém] Bot byl přidán do: <b>${guild.name}</b>`);



    guild.channels.forEach(function(channel) { 
        if (channel.type == "text" && channel.name.startsWith("chat") || channel.name.startsWith("general") || channel.name.startsWith("zpravy") || channel.name.startsWith("talk") || channel.name.startsWith("text")) {
            const embed = new Discord.RichEmbed()
             .setTitle("m0ukaBot je připojen! :white_check_mark:")
             .setColor(0x00AE86)
             .setDescription("Úspěšně jsem se připojil na tvůj server! Změň si prefix pomocí ```>prefix [pismeno]```. Nezapomeň mi dát permissi ```Administrátor``` abych mohl fungovat správně. Seznam všech příkazů zjistíš v `>info`.")
             .setFooter("Tato zpráva se automaticky vymaže za 30 vteřin!")
             channel.send({embed})
            .then(function(message) {
                message.delete(30000);
            })

            return;
        }
    })
}