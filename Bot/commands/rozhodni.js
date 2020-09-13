const Discord = require('discord.js');


exports.run = async (client, message, args) => {

    if (!args[0]) return message.channel.send(client.createEmbed(":x: Na nic jsi se nezeptal!", "#f44141", ""));

    let questions = [];

    args.forEach(function(arg) {
        questions.push(arg);
    })

    let result = Math.floor(Math.random() * questions.length);

    let embed = new Discord.RichEmbed() 
    .setAuthor(message.author.tag)
    .setColor("#4259f4")
    .addField("Otázky", questions.join(", "))
    .addField("Vybral jsem", questions[result]);

    message.channel.send({embed});

}

exports.conf = {
    enabled: true,
    aliases: ["vyber", "rozhodnout"],
  };

  exports.help = {
    name: "rozhodni",
    category: "Zábava",
    description: "Rozhodni mezi věcmi",
    usage: "rozhodni [věc1] [věc2] ..."
  };