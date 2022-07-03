//
// Imports
//
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, Permissions, ThreadManager } = require('discord.js');
const chalk = require('chalk');
var moment = require('moment');
var { open } = require('sqlite');
var sqlite3 = require('sqlite3').verbose();

const button = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setCustomId("closepoll")
        .setLabel('投票を締め切る')
        .setStyle('DANGER'),
    );

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('投票を作成する')
        .addStringOption(option =>
            option.setName('title')
            .setDescription('投票埋め込みのタイトル欄')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
            .setDescription('投票埋め込みの説明欄')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('items')
            .setDescription('投票できる項目。 (,) で一つ一つ分けてください。(みかん,りんご のように)')
            .setRequired(true))
        .addBooleanOption(option =>
            option.setName('public')
            .setDescription('締め切る前から投票結果をリアルタイムで表示するかどうか')
            .setRequired(true))
        .addBooleanOption(option =>
            option.setName('thread')
            .setDescription('投票用スレッドを作る')
            .setRequired(false)),



    async execute(interaction) {
        const pollList = interaction.options.getString('items');
        const embedTitle = interaction.options.getString('title');
        const embedDescription = interaction.options.getString('description').replaceAll('\\n', '\n');
        const createThread = interaction.options.getBoolean('thread');
        const publicPoll = interaction.options.getBoolean('public');

        console.log(`${chalk.magenta('+ cmd run:')} poll / ${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}] (${chalk.magenta.italic(`/poll title: ${embedTitle} description: ${embedDescription.replaceAll('\n', '\\n')} items: ${pollList} public: ${publicPoll} thread: ${createThread}`)})`);

        (async () => {
            const db = await open({
                filename: './data/main.db',
                driver: sqlite3.Database
            })
            let roleName = "投票マネージャー";
            if (interaction.guild.roles.cache.find(role => role.name == roleName) || interaction.member.permissions.has(Permissions.FLAGS['MANAGE_GUILD'])) {
                if (interaction.member.roles.cache.some(role => role.name === roleName) || interaction.member.permissions.has(Permissions.FLAGS['MANAGE_GUILD'])) {
                    db.run("UPDATE Info SET Count = Count + 1 WHERE rowid = 1");

                    const pollListArr = pollList.split(",");
                    const labelArr = pollListArr.map(x => ({
                        label: x,
                        value: x,
                        voteCount: 0
                    }));
                    if (pollListArr.length > 25) {
                        interaction.reply({
                                content: `DiscordAPIの制限により、25項目以上の投票は作れません！ただ今の項目数は(${pollListArr.length})です！25以下に減らしてください！`,
                                ephemeral: true,
                            })
                            .then(console.log(`${chalk.red('! poll length:')} ${chalk.gray(`${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}]`)} tried to create a poll with too many items[${pollListArr.length}].`));
                    } else {
                        const selectionMenu = new MessageActionRow()
                            .addComponents(
                                new MessageSelectMenu()
                                .setCustomId('poll')
                                .setPlaceholder('こちらから選択してください！')
                                .addOptions(labelArr),
                            );
                        const embed = new MessageEmbed()
                            .setColor('#ff6633')
                            .setTitle(embedTitle)
                            .setDescription(embedDescription);

                        try {
                            await interaction.reply({
                                embeds: [embed],
                                components: [selectionMenu, button, ]
                            });
                        } catch (err) {
                            return interaction.reply({
                                content: 'システムエラーが発生しました！重複項目がないか確認してください',
                                ephemeral: true,
                            });
                        }

                        // ----------------------------------------------------------------
                        const message = await interaction.fetchReply()

                        await db.exec(`CREATE TABLE "poll-${message.id}" ("lastInteraction" TEXT, "commandInput" TEXT, "guildName" TEXT, "guildId" INTEGER, "channelName" TEXT, "channelId" INTEGER, "pollTitle" TEXT, "pollDesc" TEXT, "pollItem" TEXT, "voteCount" INTEGER, "publicPoll" TEXT)`);
                        await db.exec(`CREATE TABLE "user-${message.id}" ("userName" TEXT, "userId" INTEGER, "pollItem" TEXT)`);

                        console.log(`${chalk.green('+ created:')} ${chalk.gray(`${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}]`)} created the poll ${chalk.gray(`"./data/main.db:poll-${message.id}" & "./data/main.db:user-${message.id}"`)}`);
                        let date = moment();
                        let placeholders = pollListArr.map((movie) => `(${interaction.guild.id}, ${interaction.channel.id}, ?, 0)`).join(',');
                        let sql = `INSERT INTO "poll-${message.id}"(guildId, channelId, pollItem, voteCount) VALUES ${placeholders}`;
                        let sql2 = `UPDATE "poll-${message.id}" SET lastInteraction = ?, commandInput = ?, guildName = ?, channelName = ?, pollTitle = ?, pollDesc = ?, publicPoll = ?`;
                        try {
                            await db.run(sql, pollListArr);
                            await db.run(sql2, `${date}`, `/poll title: ${embedTitle} description: ${embedDescription} items: ${pollList}`, `${interaction.guild.name}`, `${interaction.channel.name}`, `${embedTitle}`, `${embedDescription}`, `${publicPoll}`);
                        } catch (err) {
                            console.log(chalk.red("ERR"));
                            console.log(err);
                        }

                        if (createThread == true) {
                            if (interaction.channel.permissionsFor(interaction.applicationId).has(['MANAGE_THREADS'])) {
                                const thread = await interaction.channel.threads.create({
                                    startMessage: message.id,
                                    name: `${embedTitle}`,
                                    autoArchiveDuration: 1440,
                                    reason: '投票用スレッドが作成されました。',
                                });
                            } else {
                                const threadEmbed = new MessageEmbed()
                                    .setColor('#ff6633')
                                    .setTitle(`Thread Creation Error`)
                                    .setDescription(`\`MANAGE_THREADS\` 権限がないためスレッド作成ができませんでした。`)
                                    .setImage('https://support.discord.com/hc/article_attachments/4406694690711/image1.png')
                                    .setTimestamp();
                                await interaction.followUp({
                                    embeds: [threadEmbed],
                                    ephemeral: true,
                                });
                                console.log(chalk.red("Couldn't create thread."));
                            }
                        }
                    }
                } else {
                    interaction.reply({
                            content: "\`MANAGE_GUILD\` 権限または \"投票マネージャー\" ロールがないため、投票を作る権限がありません。",
                            ephemeral: true,
                        })
                        .then(console.log(`${chalk.yellow('! no role:')} ${chalk.gray(`${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}]`)} tried to create a poll.`))
                        .catch(console.error);
                }
            } else {
                if (interaction.channel.permissionsFor(interaction.applicationId).has(['MANAGE_ROLES'])) {
                    interaction.guild.roles.create({
                        name: roleName,
                        color: "#ff6633",
                        reason: "ボット動作のための \"投票マネージャー\" を作成しました。"
                    }).then(role => {
                        interaction.reply({
                                content: "あなたが \`MANAGE_GUILD\` 権限がない代わり、 \`\"投票マネージャー\"\` ロールを付与しました。投票ちゃんを利用してもらいたいユーザーにロールを付与すればコマンドを利用できます！",
                                ephemeral: true,
                            })
                            .then(console.log(`${chalk.green('+ role create:')} created the "投票マネージャー" role in ${chalk.gray(`${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) / ${interaction.member.displayName}[${interaction.member.id}]`)}`))
                            .catch(console.error);
                    });
                } else {
                    interaction.reply({
                            content: `あなたは \`MANAGE_GUILD\` 権限がないと共に、投票ちゃんに \`\"投票マネージャー\"\` ロールを付与する権限がありません。サーバー管理者に投票を作成してもらうか \`\"投票マネージャー\"\` ロールの作成・付与をしてもらってください。`,
                            ephemeral: true,
                        })
                        .then(console.log(`${chalk.red(`! missing permissions:`)} to create the "投票マネージャー" role in ${chalk.gray(`${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}]`)}"`))
                        .catch(console.error);
                }
            }
        })()
    },
};