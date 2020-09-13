const config = require('../config.json');
const Discord = require('discord.js');

const os = require('os'); // some eval shit

exports.run = async (client, message, args) => {

    if (message.author.id !== config.ownerid) return;

    let evalArg = args.join(" ");

    try {
    var output = JSON.stringify(eval(evalArg));
    const embed = new Discord.RichEmbed()
      .setTitle("Eval příkaz")
      .addField("Vstup:", "```\n" + evalArg + "```")
      .addField("Výstup:" , "```js\n" + output + "```");
    message.channel.send({embed});
    }
    catch (err)
    {
    message.channel.send(client.createEmbed(":x: Chyba: " + err.message, "#ff0000", ""));
    }

    client.consoleLog(`[Systém] Eval byl proveden: <code>${evalArg}</code>`);

}

exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "eval",
    category: "System",
    description: "Využij eval (Majitel bota)",
    usage: "eval [příkaz]"
  };