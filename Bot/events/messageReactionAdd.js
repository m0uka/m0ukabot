

exports.run = (client, reaction, user) => {
    if (reaction.emoji.name == "⚠" && reaction.message.channel.type == "dm" && user.id == "299170508623314967")
    {
        // handle blacklisting a bug report
        console.log("blacklisting detected");
        var sender = reaction.message.embeds[0].author.name;

        var indexBeginning = sender.lastIndexOf('(');
        var indexEnd = sender.lastIndexOf(')');

        var senderId = sender.substring(indexBeginning + 1, indexEnd);

        client.addToReportBlackList(senderId)
        .then(function() {
            reaction.message.channel.send(client.createEmbed("Uživatel " + sender + " byl úspěšně přidán do report blacklistu.", "#48f442", ""));
        })
        .catch(function(err) {
            reaction.message.channel.send(client.createEmbed(":x: Nastala chyba", "#ff0000", err.message));
        });
    }
}