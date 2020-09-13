//
var request = require('request');
const path = require('path');
const fs = require('fs');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3'); // watson sdk

var visualRecognition = new VisualRecognitionV3({
  url: 'https://gateway.watsonplatform.net/visual-recognition/api',
  iam_apikey: 'xxxxx',
  version: '2018-03-19'
});

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

module.exports = async (client, Discord) => {

  // Ikonky -----


  // ------------


  client.initUserDB = async (user) => {
    var query = `INSERT INTO money (id) VALUES ('${user.id}')`;

    client.mysql.query(query, function (error, result) {
      if (error) throw error;

      return true;
    });
  }

  client.ensureBan = async (guild, user, banIssued, banExpiry, reason) => {
    var checkQuery = `SELECT id FROM bans WHERE id = '${guild.id}-${user.id}'`;
    client.mysql.query(checkQuery, function (error, result) {
      if (error) throw error;

      if (result[0]) return true; // již existuje

      var query = `INSERT INTO bans (id, guildId, userId, banIssued, banExpiry, reason) VALUES ('${guild.id}-${user.id}', '${guild.id}', '${userId}', ${banIssued}, ${banExpiry}, '${reason}')`;

      client.mysql.query(query, function (error, result) {
        if (error) throw error;

        return true;
      });
    });
  }

  client.ensureAutomod = async (guild) => {
    var checkQuery = `SELECT id FROM automod WHERE id = '${guild.id}'`;
    client.mysql.query(checkQuery, function (error, result) {
      if (error) throw error;

      if (result[0]) return true; // již existuje

      var query = `INSERT INTO automod (id) VALUES ('${guild.id}')`;

      client.mysql.query(query, function (error, result) {
        if (error) throw error;

        return true;
      });
    });
  }


  client.notEnoughPermissions = async (message, role) => {

    var memberGuild = client.settings.get(message.member.guild.id);
    if (memberGuild.modRole != role && memberGuild.adminRole != role) {
      message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Tento server má špatně nakonfigurováné role. Tato role neexistuje: `**" + role + "**`. Změňte tuto roli pomocí `" + memberGuild.prefix + "nastaveni (modRole/adminRole) (role)**`."));
      console.log("bad conf");
    } else {
      console.log("no perm");
      message.channel.send(client.createEmbed(":x: Nemáš oprávnění!", "#ff0000", "Na tuto akci potřebuješ mít roli `**" + role + "**`."))
    }
  }

  client.checkPermission = async (user) => {
    let cond = false;
    var SQLQuery = "SELECT adminRole FROM settings WHERE id = " + user.guild.id;
    client.mysql.query(SQLQuery, function (err, result) {
      var thisConf = result[0];
      var adminRole = user.guild.roles.find("name", thisConf.adminRole);
      if (adminRole) {
        if (user.roles.has(adminRole)) {
          cond = true;
        }
      }
    });

    return await (user.hasPermission("ADMINISTRATOR") || cond);
  }


  client.faceRecognition = async (image) => {

    image = 'http://farm4.static.flickr.com/3097/5751698994_e6ba368c04.jpg';

    var params = {
      url: image,
    };


    await visualRecognition.detectFaces(params, async function (err, res) {
      if (!err) {
        console.log(res.images[0].faces[0]);
      } else {
        console.log(err);
      }
    });
  }

  client.imageRecognition = async (message, image) => {

    var params = {
      url: image,
    };

    await visualRecognition.classify(params, async function (err, res) {
      if (!err) {
        var img = res;

        var classes = img.images[0].classifiers[0].classes;

        classes = await sortByKey(classes, 'score').reverse();

        const embed = new Discord.RichEmbed()
          .setTitle('Rozpoznávání')
          .setColor('#42c8f4')
          .setImage(image)
          .addField(classes[0].class, classes[0].score, true)
          .addField(classes[1].class, classes[1].score, true)
          .addField(classes[2].class, classes[2].score, true)
          .addField(classes[3].class, classes[3].score, true)
          .addField(classes[4].class, classes[4].score, true)
        message.channel.send({ embed });





      } else {
        return message.channel.send(client.createEmbed(":x: Chyba", "#ff0000", "Nemohl jsem rozpoznat obrázek, zkontroluj URL"));
      }

    });


  }

  client.botHasPermission = async (message, permission) => {
    return message.channel.permissionsFor(client.user).hasPermission(permission);
  }

  client.addCooldown = (user, cooldown) => {
    if (!cooldown) cooldown = 5000;

    client.cmdUsedRecently.add(user);
    setTimeout(() => {
      // Removes the user from the set after 5 seconds
      client.cmdUsedRecently.delete(user);
    }, cooldown);
  }

  client.consoleLog = (msg) => {

    request.post(
      'http://54.93.223.228:3000/api/sendmessage',
      { json: { message: msg } },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // log the message
        }
      }
    );

  }

  client.consoleError = (file, err) => {
    client.consoleLog(`<b><span class=text-danger>[Chyba]</span></b> Nastala chyba v modulu <b><span class=text-primary>${file}</span></b>: <span class=text-danger>${err.message}</span>`)
  }

  client.commandStats = (msgcontent) => {
    request.post(
      'http://54.93.223.228:3000/api/commandStats',
      { json: { message: msgcontent } },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // log the message
        }
      }
    );
  }


  client.createEmbed = (title, color, desc) => {
    const embed = new Discord.RichEmbed()
      .setTitle(title)
      .setColor(color)
      .setDescription(desc)
    return ({ embed });
  }

  client.addToReportBlackList = async (userId) => {

    const blackListConf = await client.blacklist.get(userId);

    if (blackListConf == null) {
      const defaultSettings = {
        time: [0],
        guildsBlocked: [],
        commandBlacklist: false,
        reportBlackList: true,
      }

      await client.blacklist.set(userId, defaultSettings);
    }
    else {
      blackListConf.reportBlackList = true;
      await client.blacklist.set(userId, blackListConf);
    }



  }

  client.removeFromReportBlackList = async (userId) => {

    const blackListConf = await client.blacklist.get(userId);

    if (blackListConf == null) {
      return false;
    }
    else {
      blackListConf.reportBlackList = false;
      await client.blacklist.set(userId, blackListConf);
    }


  }

  client.loadCommand = (commandName) => {
    try {
      const props = require(`../commands/${commandName}`);
      if (!props.conf.enabled) return false;
      console.log(`Načítání příkazu: ${props.help.name}.`);
      if (props.init) {
        props.init(client);
      }
      client.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
        client.aliases.set(alias, props.help.name);
      });
      return false;
    } catch (e) {
      console.error(e);
      return `Nemohl jsem načíst ${commandName}: ${e}`;

    }
  };

  client.unloadCommand = async (commandName) => {
    let command;
    if (client.commands.has(commandName)) {
      command = client.commands.get(commandName);
    } else if (client.aliases.has(commandName)) {
      command = client.commands.get(client.aliases.get(commandName));
    }
    if (!command) return `Příkaz \`${commandName}\` neexistuje, a ani není alias`;

    if (command.shutdown) {
      await command.shutdown(client);
    }
    delete require.cache[require.resolve(`../commands/${commandName}.js`)];
    return false;
  };


}