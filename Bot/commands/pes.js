const Discord = require('discord.js');
const request = require("request")

exports.run = async (client, message, args) => {

    let json;

    let url = "https://random.dog/woof.json?filter=mp4"

    await request({
     url: url,
     json: true
    }, function (error, response, body) {

     if (!error && response.statusCode === 200) {
         json = body;
     }


     if (!body.url)
      return message.channel.send(client.createEmbed(":hourglass: Zkus to prosím později", "#f46e42", ""))

     let embed = new Discord.RichEmbed()
        .setTitle("Pes")
        .setImage(json.url)
        .setColor("#42a1f4")
     message.channel.send({embed});

})
}

exports.conf = {
    enabled: true,
    aliases: ["pejsek", "dog", "psi"],
  };

  exports.help = {
    name: "pes",
    category: "Zábava",
    description: "Zobraz náhodného psa!",
    usage: "pes"
  };
