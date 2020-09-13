const Discord = require('discord.js');


exports.run = async (client, message, args) => {

    if (!args[0]) return message.channel.send(client.createEmbed(":x: Na nic jsi se nezeptal!", "#f44141", ""));

    let replies = ["Ano.", "Ne.", "Nevím.", "Zeptej se později."];
    let result = Math.floor(Math.random() * replies.length);
    let question = args.join(" ");

    client.consoleLog(`[8ball] Uživatel ${message.author.username}#${message.author.discriminator} se zeptal na: <i>${question}</i> - <b>${replies[result]}</b>`);


    let embed = new Discord.RichEmbed() 
    .setAuthor(message.author.tag)
    .setColor("#4259f4")
    .addField("Otázka", question)
    .addField("Odpověd", replies[result]);

    message.channel.send({embed});
}

exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "8ball",
    category: "Zábava",
    description: "Zeptej se na otázku",
    usage: "8ball [command]"
  };