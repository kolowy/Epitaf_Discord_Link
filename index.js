const keepAlive = require('./server');
keepAlive(); //keepAlive replit

const fs = require("fs");
const Discord = require("discord.js");
var CronJob = require('cron').CronJob;
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"]
});
const { tasks, calendar, endTime } = require('./requests/tasks');
client.config = require("./config/config.json");


require('dotenv').config()

client.on("ready", () => require("./requests/ready.js")(client));

//appel des fichiers
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
}); 

//tell the task and the calendar for the nexts day, at 16h
var job = new CronJob('30 17 * * *', function() {
    var guild = client.guilds.cache.get('882913579626561566');
    if(guild && guild.channels.cache.get('882964799036747796')){
        var channel = guild.channels.cache.get('882964799036747796')
        channel.messages.fetch({ limit: '99' }).then(messages => {
            channel.bulkDelete(messages)
        });
        tasks(channel).then(()=> { channel.send('Calendar for Tommorow : ')})
        calendar(channel);
        
    }
}, null, true, 'Europe/Paris');
job.start();

var JTW = new CronJob('43 10 * * *', function() {
    apiToToken
}, null, true, 'Europe/Paris');
JTW.start();

const { apiToToken } = require('./requests/tasks')
apiToToken


client.login(process.env.TOKEN_DISCORD);