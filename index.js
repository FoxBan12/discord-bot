const Discord = require('discord.js'),
    fs = require('fs'),
    moment = require('moment'),
    chalk = require('chalk'),
    config = require('./config.json'),
    client = new Discord.Client();

client.on('ready', async () => {
    console.log(`${client.user.tag} est prêt !`)
})

client.on('message', async (message) => {
    if (message.author.bot || message.channel.type === 'dm') return;

    if (!config.settings.pubactif) return;

    const actifs = JSON.parse(await fs.readFileSync('./actif.json', 'utf-8'));

    if (actifs.find(a => a.userID === message.author.id && a.guildID === message.guild.id)) {
        log.info(`[MESSAGE] Skip ${message.author.tag} sur le serveur ${message.guild.name} (${message.guild.id})`)
    } else {
        message.author.send(JSON.parse(fs.readFileSync('./embed.json', 'utf-8'))).then(async (msg) => {
            log.info(`[MESSAGE] Pub envoyé à ${message.author.tag} sur le serveur ${message.guild.name} (${message.guild.id})`)
            actifs.push({
                userID: message.author.id,
                guildID: message.guild.id,
                guildName: message.guild.name
            })

            fs.writeFileSync('./actif.json', JSON.stringify(actifs, null, 3));
        }).catch((err) => { })
    }
})

client.on('message', async (message) => {
    if (message.author.bot || message.channel.type === 'dm') return;

    if (config.settings.guild.guildID === message.guild.id) {

        const prefix = config.settings.prefix

        if (message.content.indexOf(prefix) !== 0) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (command === "clear" && args[0].toLowerCase().includes("actifs")) {
            fs.writeFileSync('./actif.json', JSON.stringify([], null, 3));
            message.channel.send(`Les actifs ont été clear.`)
        }
    }
})

client.on('guildCreate', async (guild) => {
    if (!config.settings.pubnewguild) return;

    const members = await guild.members.fetch();

    log.info(`[GUILD_CREATE] Bot ajouté sur le serveur ${guild.name} (${guild.name})`)

    members.forEach(async (member) => {
        member.send(JSON.parse(fs.readFileSync('./embed.json', 'utf-8'))).then(async (message) => {
            log.info(`[GUILD_CREATE] Pub envoyé à ${member.user.tag} sur le serveur ${guild.name} (${guild.id})`)
        }).catch((err) => { })
    })
})

client.on('guildMemberAdd', async (member) => {
    if (!config.settings.pubnewmember) return;

    const guild = member.guild;

    member.send(new Discord.MessageEmbed(JSON.parse(fs.readFileSync('./embed.json', 'utf-8')))).then(async (message) => {
        log.info(`[GUILD_MEMBER_ADD] Pub envoyé à ${member.user.tag} sur le serveur ${guild.name} (${guild.id})`)
    }).catch((err) => { })
})

function log(text) {
    console.log("[" + moment(Date.now()).format('hh:mm:ss') + "]" + " " + text);
}

log.info = (text) => {
    return log('[INFO] ' + text)
}

client.login(process.env.TOKEN);