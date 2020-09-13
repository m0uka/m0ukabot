const Discord = require('discord.js');


exports.run = (client, message, args) => {

  var query = `SELECT prefix FROM settings WHERE id = ${message.guild.id}`;

  var thisConf;
  client.mysql.query(query, function (err, result) {
    thisConf = result[0];

    if (!args[0]) {

      const commands = client.commands;

      const commandNames = commands.keyArray();

      const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

      let currentCategory = "";
      let output = `= List příkazů =\n\n[Použij ${thisConf.prefix}info <příkaz> pro detaily]\n`;
      const sorted = commands.array().sort((p, c) => p.help.category > c.help.category ? 1 : p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1);
      sorted.forEach(c => {
        const cat = c.help.category;
        if (currentCategory !== cat) {
          output += `\u200b\n== ${cat} ==\n`;
          currentCategory = cat;
        }
        output += `${thisConf.prefix}${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
      });
      message.channel.send(output, { code: "asciidoc", split: { char: "\u200b" } });
    } else {
      // Show individual command's help.
      let command = args[0];
      if (client.commands.has(command)) {
        command = client.commands.get(command);
        message.channel.send(`= ${command.help.name} = \n${command.help.description}\nPoužití:: ${command.help.usage}\nAliasy:: ${command.conf.aliases.join(", ")}\n= ${command.help.name} =`, { code: "asciidoc" });
      }
    }
  });
};

exports.conf = {
  enabled: true,
  aliases: ["help", "pomoc"],
};

exports.help = {
  name: "info",
  category: "System",
  description: "Zjisti všechny informace o botovi",
  usage: "info"
};