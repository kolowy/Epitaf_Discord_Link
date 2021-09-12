const { tasks } = require('../requests/tasks')

exports.run = (client, message, args) => {
    tasks(message.channel).catch(console.error);
}