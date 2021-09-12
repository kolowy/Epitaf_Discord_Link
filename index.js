const keepAlive = require('./server');
keepAlive(); //keepAlive replit

const fs = require("fs");
const Discord = require("discord.js");
var CronJob = require('cron').CronJob;
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"]
});
const { tasks, calendar } = require('./requests/tasks');
client.config = require("./config/config.json");

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
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
var job = new CronJob('00 16 * * *', function() {
    var guild = client.guilds.cache.get('882913579626561566');
    if(guild && guild.channels.cache.get('882964799036747796')){
        tasks(guild.channels.cache.get('882964799036747796'))
        calendar(guild.channels.cache.get('882964799036747796'));
    }
}, null, true, 'Europe/Paris');
job.start();

client.login(process.env.TOKEN_DISCORD);