const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, } = require('discord.js');
var { open } = require('sqlite');
var sqlite3 = require('sqlite3').verbose();
const chalk = require('chalk');

module.exports = {
	data: new SlashCommandBuilder()
		.setDefaultPermission(true)
		.setName('info')
		.setDescription('ボットについての情報色々'),
	async execute(interaction) {
		(async () => {
			const db = await open({
				filename: './data/main.db',
				driver: sqlite3.Database
			})

			let totalPolls = await db.get('SELECT Count FROM Info WHERE rowid = 1');
			let totalVotes = await db.get('SELECT Count FROM Info WHERE rowid = 2');
			const embed = new MessageEmbed()
				.setColor('#ff6633')
				.setTitle('ボット情報')
				.setThumbnail(`https://cdn.discordapp.com/attachments/950289587727638578/991329392435413073/pollbog.png`)
				.setAuthor('投票ちゃん')

				.addField('合計投票作成数', `${JSON.stringify(totalPolls.Count)}`, true)
				.addField('合計票数', `${JSON.stringify(totalVotes.Count)}`, true)
				.addField('API応答速度 (ms)', `${Math.round(interaction.client.ws.ping)}`, true)

				.addField('サーバー参加数', `${interaction.client.guilds.cache.size}`, true)

				.setFooter('やあ ^^)')
				.setTimestamp()
			console.log(`${chalk.magenta('+ cmd run:')} info / ${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}]`);
			return interaction.reply({
				embeds: [embed]
			});
		})()
	},
};