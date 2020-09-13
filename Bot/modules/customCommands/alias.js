

exports.run = async (client, message, args, cmd) => {
    var code = cmd.code;
    
    var cmd = client.commands.get(code.cmd[0]) || client.commands.get(client.aliases.get(code.cmd[0]));
    args = code.cmd;
    args.shift();

    cmd.run(client, message, args);
}