exports.run = async (client, message, args) => {
    if(!args[0] || args.size < 1) return message.channel.send(client.createEmbed("Jméno commandu nebylo specifikováno", "#f44141", ""));
    // the path is relative to the *current folder*, so just ./filename.js


    if (message.author.id !== "299170508623314967") return;

    if (args[1] == "modul") {
      try {
      delete require.cache[require.resolve(`../modules/${args[0]}.js`)];
      message.channel.send(client.createEmbed(":white_check_mark: Modul byl úspěšně reloadován.", "#42f483", ""));
      return;
      }
      catch(err)
      {
        return message.channel.send(client.createEmbed(":x: Tento modul neexistuje.", "#ff0000", ""))
      }
    }

    if (args[0] == "dashboard") {
      try {
        
        delete require.cache[require.resolve(`../../Dashboard/index.js`)];
        const props = require(`../../Dashboard/index.js`);
        if (props.init) {
          props.init(client);
        }
        message.channel.send(client.createEmbed(":white_check_mark: Dashboard byl úspěšně reloadován.", "#42f483", ""));
        return;
        }
        catch(err)
        {
          return message.channel.send(client.createEmbed(":x: Nastala chyba", "#ff0000", err))
        }
    }


    let response = await client.unloadCommand(args[0]);
    if (response) return message.channel.send(client.createEmbed(`Chyba unloadování: ${response}`, "#f44242", ""));

    response = client.loadCommand(args[0]);
    if (response) return message.channel.send(client.createEmbed(`Chyba načítání: ${response}`, "#f44242", ""));

    message.channel.send(client.createEmbed(`Modul **${args[0]}** byl reloadován`, "#42a4f4", ""));

    client.consoleLog(`[Systém] Modul <b>${args[0]}</b> byl reloadován.`);
};

exports.conf = {
    enabled: true,
    aliases: [],
  };

  exports.help = {
    name: "reload",
    category: "System",
    description: "Reloaduje příkaz",
    usage: "reload [command]"
  };