const Discord = require("discord.js");
const client = new Discord.Client();
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

const config = require("./config.json");

const Enmap = require('enmap');
const MySQL = require('mysql2');


const AutoModerator = require(`./modules/automod.js`);

client.mysql = MySQL.createPool({ // Inicializace připojení
  host: 'localhost',
  user: 'xxxx',
  password: 'xxxx',
  database: 'xxxx',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});




client.commandModules = ["bakalari", "text", "alias"];

// Enmap initialization 
client.settings = new Enmap({ name: "settings" });
client.automod = new Enmap({ name: "automod" });

client.bans = new Enmap({ name: "bans" });
client.money = new Enmap({ name: "money" });

client.blacklist = new Enmap({ name: "blacklist" });
client.whitelist = new Enmap();

client.commands = new Enmap();
client.aliases = new Enmap();

client.cmdUsedRecently = new Set();

client.customCommands = [];

client.serversPrefixes = []; // cache, aby jsme nemuseli dávat SQL request každou zprávu

client.refreshPrefixCache = async () => {
  client.serversPrefixes = [];
  var cacheQuery = "SELECT id, prefix FROM settings";
  client.mysql.query(cacheQuery, async function (err, result) {
    if (err) throw err;

    await result.forEach(function (guild) {
      client.serversPrefixes.push({ id: guild.id, prefix: guild.prefix });
    });

  });
}




require("./modules/functions.js")(client, Discord);

// This loop reads the /events/ folder and attaches each event file to the appropriate event.
readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, (...args) => eventFunction.run(client, ...args));
  });
});

// client.refreshCustomCommands = async () => {
//   var sqlQuery = "SELECT * FROM customCommands";
//   client.mysql.query(sqlQuery, function (err, result) {
//     if (err) throw err;

//     client.customCommands = result;
//   });
// }

// setInterval(client.refreshCustomCommands, 7200000); // každé dvě hodiny refreshnout (kvůli bakalářům, atd.. [tokeny])

const init = async () => {

  var fileRefresh = require(`./modules/fileRefresh.js`);


  // client.refreshCustomCommands();


  const cmdFiles = await readdir("./commands/");
  console.log(`Načítám celkem ${cmdFiles.length} příkazů.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });


  await client.refreshPrefixCache();
}

init();




client.on('error', console.error); // handle some errors




client.on("message", async message => {


  AutoModerator.run(client, message);

  if (message.channel.type == "dm") return;

  var guildPrefix = client.serversPrefixes.find(obj => obj.id == message.guild.id);


  if (!guildPrefix || !guildPrefix.prefix) return;


  if (message.author.bot) return;
  if (message.content.indexOf(guildPrefix.prefix) !== 0) return;

  

  if (message.content == guildPrefix.prefix + "skip" || message.content == guildPrefix.prefix + "stop") return;



  const args = message.content.slice(guildPrefix.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));


  if (!cmd) { // ještě si zjistíme jestli to je vlastní příkaz (aby jsme zbytečně každý příkaz nezatěžovali databázi)
    return;
  }

  cmd.run(client, message, args);
  //client.commandStats(message.content.replace(guildPrefix.prefix, ''));

});


client.login(config.token);


