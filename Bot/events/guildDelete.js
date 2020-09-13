

exports.run = (client, guild) => {
    var removeQuery = "DELETE FROM settings WHERE id = '" + guild.id + "'";
    // Odebrání z databáze
    client.consoleLog(`[Systém] Bot byl odebrán z: <b>${guild.name}</b>`);
}