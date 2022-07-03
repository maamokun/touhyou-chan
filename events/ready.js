const chalk = require('chalk');
const fs = require('fs');
var { open } = require('sqlite');
var sqlite3 = require('sqlite3').verbose();


module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        (async () => {
            const db = await open({
                filename: './data/main.db',
                driver: sqlite3.Database
            })
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

            setInterval(async () => {
                let totalPolls = await db.get('SELECT Count FROM Info WHERE rowid = 1');
                let totalVotes = await db.get('SELECT Count FROM Info WHERE rowid = 2');
                client.user.setActivity(`${JSON.stringify(totalPolls.Count)} 投票作成済み・合計票数 ${JSON.stringify(totalVotes.Count)} ^^)`, {
                    type: 'PLAYING',
                });
            }, 10000);

            console.log(`${chalk.blue('+ started:')} ${commandFiles}`);
        })()
    },
};