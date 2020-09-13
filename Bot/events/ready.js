const checkBans = require(`../modules/checkBans.js`);
const twitchCheck = require(`../modules/twitchCheck.js`);
const dashboard = require('../../Dashboard/index.js');

exports.run = async (client) => {
    console.log(`m0ukaBot inicializován, ${client.channels.size} channelů na ${client.guilds.size} serverů, celkem ${client.users.size} uživatelů.`);
    client.consoleLog(`[Systém] <span class="text-success">Bot se úspěšně</span> inicializoval.`);
    client.user.setUsername("m0ukaBot Reborn");
    client.user.setPresence({game: {name: client.users.size + " lidem na " + client.guilds.size + " serverech"}, status: 'online'});



    dashboard.run(client); // zapnutí dashboardy

    // client.setInterval(() => {
    //     checkBans.run(client);
    // }, 6000)

    // client.setInterval(() => {
    //     twitchCheck.run(client);
    // }, 10000)

}