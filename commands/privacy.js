const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, } = require('discord.js');
const chalk = require('chalk');

module.exports = {

	data: new SlashCommandBuilder()
		.setDefaultPermission(true)
		.setName('privacy')
		.setDescription('Discordデータの取り扱いについて'),
	async execute(interaction) {
		const embed = new MessageEmbed()
			.setColor('#ff6633')
			.setTitle('Discordデータの取り扱いについて')
			.setThumbnail(`https://cdn.discordapp.com/attachments/950289587727638578/991329392435413073/pollbog.png`)
			.setAuthor('MikanDev Privacy Policy', 'https://cdn.discordapp.com/avatars/800027418416250901/0954e3206d30245d7653a38978755e6f.png?size=2048', 'https://maamokun.cloud')
			.setDescription(`\`\`\`保存されるDiscordデータ\`\`\`messageId、 guildName、 guildId、 channelName、 channelId、 userName、 userId、 投票タイトル、 投票説明 と 投票項目\`\`\`何にDiscordデータを利用しているか\`\`\`重複投票を防ぐ等のボットの動作に必要なデータです。 \`\`\`データの削除依頼はできますか？\`\`\`はい。 [サポートサーバー](https://discord.gg/4gfEnY83nx) より受け付けています。`)
			.setFooter('投票終了、または1ヶ月間投票の操作がなければデータは自動的にも削除されます。')
		console.log(`${chalk.magenta('+ cmd run:')} privacy / ${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}]`);
		return interaction.reply({
			embeds: [embed]
		});
	},
};