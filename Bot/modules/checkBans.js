

exports.run = async (client) => {

    var bans = [];
    var sqlQuery = `SELECT * FROM bans`;
    client.mysql.query(sqlQuery, function (err, result) {
        if (err) throw err;
        bans = result;

        var guilds = client.guilds;

        bans.forEach(async function (ban) {


            if (ban.banExpiry < Math.floor(new Date() / 1000)) {
                var guild = guilds.get(ban.guildId);
                var user = client.users.get(ban.userId);

                var bannedUsers = [];

                var guildBans = await guild.fetchBans()
                    .then(function (bans) {
                        bans.forEach(function (fetchedBan) {
                            bannedUsers.push(fetchedBan);
                        })
                    })

                if (!bannedUsers.includes(user)) {

                    var deleteQuery = `DELETE FROM bans WHERE id = '${ban.guildId}-${ban.userId}'`;
                    client.mysql.query(deleteQuery, function (err, result) {
                        if (err) throw err;
                        return;
                    });

                }



                guild.unban(ban.userId)
                    .then(function (user) {
                        var deleteQuery = `DELETE FROM bans WHERE id = '${ban.guildId}-${ban.userId}'`;
                        client.mysql.query(deleteQuery, function (err, result) {
                            if (err) throw err;
                        });
                    })
                    .catch(console.error);
            }

        })

    });

} 