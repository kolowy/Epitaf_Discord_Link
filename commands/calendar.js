const { calendar } = require('../requests/tasks')

exports.run = (client, message, args) => {
    calendar(message.channel).catch(console.error);
}