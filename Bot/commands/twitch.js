
// Twitch command
const Discord = require('discord.js');
const config = require('../config.json');
const request = require('request');


exports.run = async (client, message, args) => {

    if (args[0] == "info")
    {
        var thisGuild = client.settings.get(message.guild.id);

        if (!thisGuild.streamers)
        {
            thisGuild.streamers = [];
            return message.channel.send(client.createEmbed(":x: Zatím tento server nemá žádné nastavené notifikace!", "#ff0000", ""));
        }

        var streamers = thisGuild.streamers.join(", ")
        return message.channel.send(client.createEmbed(":information_source: Streameři", "", streamers));
    }

    if (args[0] == "odebrat")
    {
        if (!args[1]) return message.channel.send(client.createEmbed(":x: Musíš specifikovat koho chceš odebrat!","#ff0000",""));

        var thisGuild = client.settings.get(message.guild.id);
        var index = thisGuild.streamers.indexOf(args[1]);
        if (index > -1) {
            thisGuild.streamers.splice(index, 1);
            message.channel.send(client.createEmbed(":white_check_mark: Streamer " + args[1] + " byl odebrán.", "#6bf442", ""))
            client.settings.set(message.guild.id, thisGuild);
        } else {
            message.channel.send(client.createEmbed(":x: Tento streamer není v databázi.", "#ff0000", ""))
        }
        return;
    
    }

    if (args[0] == "přidat" || args[0] == "pridat")
    {

        if (!args[1]) return message.channel.send(client.createEmbed(":x: Musíš specifikovat koho chceš přidat!","#ff0000",""));

        var thisGuild = client.settings.get(message.guild.id);

        if (!thisGuild.streamers)
            thisGuild.streamers = [];

        var index = thisGuild.streamers.indexOf(args[1]);
        if (index > -1)
        {
            return message.channel.send(client.createEmbed(":x: Tento uživatel již je v databázi.", "#ff0000", ""));
        }


        var channelOptions = {
            url: 'https://api.twitch.tv/kraken/channels/' + args[1],
            headers: {
                  'Client-ID': 'xxxx'
            }
        };

        await request(channelOptions, function(error, response, body) {
            if (error) return console.log(error);
            if (!error && response.statusCode == 200) {
                thisGuild.streamers.push(args[1]);
                message.channel.send(client.createEmbed(":white_check_mark: Streamer " + args[1] + " byl úspěšně přidán.", "", ""))
                client.settings.set(message.guild.id, thisGuild);
            } else {
                return message.channel.send(client.createEmbed(":x: Tento streamer neexistuje.", "#ff0000", ""))
            }
        });


        return;
    }

    var options = {
        url: 'https://api.twitch.tv/kraken/streams/' + args[0],
        headers: {
          'Client-ID': 'xxxx'
        }
      };

      
      await request(options, function(error, response, body) {
        if (error) return console.log(error);
        if (!error && response.statusCode == 200) {
            info = JSON.parse(body);

            if (info.stream == null)
            {
                return message.channel.send(client.createEmbed(":warning: Streamer " + args[0] + " je offline.", "", ""));
            } else {
                const embed = new Discord.RichEmbed()
                .setAuthor(args[0], info.stream.channel.logo)
                .addField("Streamuje ", info.stream.game)
                .addField("Jméno streamu ", info.stream.channel.status)
                .addField("Diváků ", info.stream.viewers)
                .setColor("#6bf442")
                message.channel.send({embed});
                return;
            }


          }
      });


      

      
    
}

exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "twitch",
    category: "Služby",
    description: "Zjisti jestli někdo streamuje",
    usage: "twitch (uživatel)"
  };