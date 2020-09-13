const config = require('../config.json');
const hrat = require('./hrat.js');

exports.run = async (client, message, args) => {// eslint-disable-line no-unused-vars
    if (message.author.id !== config.ownerid) return;
    await message.channel.send(client.createEmbed(":white_check_mark: m0ukaBot byl restartován.", "#40ce42", ""));
    await client.consoleLog(`[Systém] Probíhá <span class="text-info">restart</span>.`);
    console.log("Probíhá restart...");
    client.commands.forEach( async cmd => {
      await client.unloadCommand(cmd);
    });
    process.exit(1);
  };
  
  exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "reboot",
    category: "System",
    description: "Restartuje bota - pouze pro majitele",
    usage: "reboot"
  };