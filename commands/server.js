const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, } = require('discord.js');
const chalk = require('chalk');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('このサーバーについて'),
	async execute(interaction) {

		const embed = new MessageEmbed()
			.setColor('#ff6633')
			.setTitle('サーバー情報')
			.setThumbnail(`${interaction.guild.iconURL({dynamic: true,})}`)
			.addField('名前', `${interaction.guild.name}`, true)
			.addField('サーバー所有者', `<@${interaction.guild.ownerId}>`, true)
			.addField('メンバー数', `${interaction.guild.memberCount}`, true)

			.addField('\u200B', `\u200B`)

			.addField('ブースト数', `${interaction.guild.premiumSubscriptionCount}`, true)
			.addField('パートナーサーバー', `${interaction.guild.partnered}`, true)
			.addField('言語', `${interaction.guild.preferredLocale}`, true)

			.addField('\u200B', `\u200B`)

			.addField('バナーURL', `${interaction.guild.splashURL()}`, true)
			.addField('公開サーバーバナーURL', `${interaction.guild.discoverySplashURL()}`, true)

			.setTimestamp(interaction.guild.createdAt)

		console.log(`${chalk.magenta('+ cmd run:')} server / ${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}]`);
		return interaction.reply({
			embeds: [embed]
		});
	},
};