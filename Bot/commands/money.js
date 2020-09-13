
// Money command
const Discord = require('discord.js');
const config = require('../config.json');


exports.run = async (client, message, args) => {

  var money = 0;

  client.mysql.query(`SELECT money FROM money WHERE id = '${message.author.id}'`, async function (err, result, fields) {
    if (err) throw err;
    if (!result[0]) 
    {
      await client.initUserDB(message.author);
    } else {
      money = result[0].money;
    }



    if (!args[0])
      message.channel.send(client.createEmbed(":dollar: V peněžence máš: ", "#89f441", money + " Kč"));


    if (args[0]) {

      if (message.author.id !== "299170508623314967") return;
      let user = message.mentions.users.first()
      thisMoney = await client.money.get(user.id);

      if (args[0] == "přidat")
        thisMoney.money += Number(args[1]);

      if (args[0] == "nastavit")
        thisMoney.money = Number(args[1]);

      if (args[0] == "odebrat")
        thisMoney.money -= Number(args[1]);


      client.money.set(user.id, thisMoney);
      message.channel.send(client.createEmbed(":white_check_mark: Příkaz úspěšně proveden.", "", ""));
    }

  });

}

exports.conf = {
  enabled: true,
  aliases: ["peníze", "penízky", "penizky", "penize", "peněženka"],
};

exports.help = {
  name: "money",
  category: "Ekonomika",
  description: "Zjisti kolik peněz máš v peněžence",
  usage: "money"
};