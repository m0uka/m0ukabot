const Discord = require('discord.js');
const config = require('../config.json');
const request = require('request');

var streamersOnline = [];

function wait(milleseconds) {
    return new Promise(resolve => setTimeout(resolve, milleseconds))
}

async function checkForStreamers(client) {
    async function loopClients() {
    client.guilds.forEach(async function(guild){

        var thisGuild = client.settings.get(guild.id);

        if (!thisGuild) return;

        if (!thisGuild.streamers) return;



        thisGuild.streamers.forEach(async function(streamer) {
            var options = {
                url: 'https://api.twitch.tv/kraken/streams/' + streamer,
                headers: {
                  'Client-ID': 'xxx'
                }
              };

              await request(options, function(error, response, body) {
                if (error) return console.log(error);
                if (!error && response.statusCode == 200) {
                    info = JSON.parse(body);
        
                    if (info.stream == null)
                    {
                        var index = streamersOnline.indexOf(streamer);
                        if (index > -1) {
                            streamersOnline.splice(index, 1);
                            console.log("[Twitch] " + streamer + " je nyní offline");
                            try {
                            guild.channels.find("name", thisGuild.annouceChannel).send(client.createEmbed(":octagonal_sign: " + streamer + " je nyní offline.", "#ff0000", ""));
                            }
                            catch (err)
                            {
                                // nemohl jsem najít kanál
                                var channels = guild.channels;
                                for (i = 0; i < channels.array().length; i++)
                                {
                                    if (channels[i].type !== "text")
                                        return;

                                    channels[i].send(client.createEmbed(":warning: Nemohl jsem najít channel pro sdělení, nastavte ho pomocí `" + thisGuild.prefix + "nastaveni annouceChannel [kanál]`", "#ff0000", ""));
                                    break;
                                }
                            }
                        }
                        return;
                    } else {
                        if ((streamersOnline.indexOf(streamer) > -1)) return;
                        streamersOnline.push(streamer);
                        console.log("[Twitch] " + streamer + " je nyní online");
                        const embed = new Discord.RichEmbed()
                        .setTitle(":white_check_mark: Nyní streamuje")
                        .setAuthor(info.stream.channel.name, info.stream.channel.logo)
                        .addField("Streamuje ", info.stream.game)
                        .addField("Jméno streamu ", info.stream.channel.status)
                        .addField("Diváků ", info.stream.viewers)
                        .setColor("#6bf442")
                        try {
                        guild.channels.find("name", thisGuild.annouceChannel).send({embed});
                        }
                        catch (err)
                        {
                            // nemohl jsem najít kanál
                            var channels = guild.channels;
                            for (i = 0; i < channels.array().length; i++)
                            {
                                if (channels[i].type !== "text")
                                    return;

                                channels[i].send(client.createEmbed(":warning: Nemohl jsem najít channel pro sdělení, nastavte ho pomocí `" + thisGuild.prefix + "nastaveni annouceChannel [kanál]`", "#ff0000", ""));
                                break;
                            }
                        }
                        return;
                    }
        
        
                  }
              });

        })
        await wait(1000); // počká vteřinu před dalším requestem (aby nedělal problémy)
    })
    }
    loopClients();
}


exports.run = async (client) => {

    checkForStreamers(client);

}