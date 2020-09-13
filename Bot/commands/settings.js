
const config = require('../config.json');

exports.run = async (client, message, args) => {

  var keyQuery = "SELECT column_name FROM information_schema.columns WHERE table_name='settings'"; // zjistit column jména
  client.mysql.query(keyQuery, async function (err, result) {
    if (err) throw err;

    var keysArr = result.map(a => a.column_name); // zjistíme si columnname property a extrahujeme do arraye

    keysArr.shift(); // odstraníme si ID (vždy první)


    // Pak se zeptáme jestli je admin
    if (!await client.checkPermission(message.member)) return message.channel.send(client.createEmbed(":x: Nemáš dostatečná práva!", "#f44242", ""));

    if (!args[0]) {
      var keys = keysArr.join(", ");
      message.channel.send(client.createEmbed("Všechny vlastnosti: ```" + keys + "```", "#42f477", ""));
      return;
    }

    if (!args[1]) {
      message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Prosím specifikuj vlastnost konfigurace!"));
      return;
    }




    const key = args[0];
    // Since we inserted an object, it comes back as an object, and we can use it with the same properties:
    if (!keysArr.includes(key)) return message.channel.send(client.createEmbed(":x: Tato vlastnost neexisutje.", "#f44242", ""));


    var keyGetQuery = `UPDATE settings SET ${key} = '${args[1]}' WHERE id = '${message.guild.id}'`;
    client.mysql.query(keyGetQuery, function (err, result) {
      if (err) throw err;


      // Pak si tady dáme log
      client.consoleLog(`[Nastavení] Uživatel ${message.author.username} změnil nastavení svého serveru: <b>${key}:${args[1]}</b>`);

      client.refreshPrefixCache(); // refresh prefix cache

      // We can confirm everything's done to the client.
      message.channel.send(client.createEmbed(`Vlastnost konfigurace ${key} byla změněna na:\n\`${args[1]}\``, "#41f483", ""));
    });
  });
}

exports.conf = {
  enabled: true,
  aliases: ["nastaveni", "nastavení", "nastavit"],
};

exports.help = {
  name: "settings",
  category: "System",
  description: "Nastav config (pouze pro admin role)",
  usage: "settings [vlastnost] [value]"
};