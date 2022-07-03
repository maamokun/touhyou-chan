const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton, } = require('discord.js');
const chalk = require('chalk');

const button = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setLabel('サポートサーバー')
        .setURL('https://discord.gg/4gfEnY83nx')
        .setStyle('LINK'),
        new MessageButton()
        .setLabel('デイス速')
        .setURL('https://dissoku.net')
        .setStyle('LINK'),

        new MessageButton()
        .setLabel('Ko-Fi')
        .setURL('https://ko-fi.com/maamokun')
        .setStyle('LINK'),
    );

module.exports = {

    data: new SlashCommandBuilder()
        .setDefaultPermission(true)
        .setName('help')
        .setDescription('投票作成の方法等役立つ情報を表示する'),
    async execute(interaction) {
        const embed = new MessageEmbed()
            .setColor('#ff6633')
            .setTitle('投票ちゃんヘルプ')
            .setThumbnail(`https://cdn.discordapp.com/attachments/950289587727638578/991329392435413073/pollbog.png`)
            .setAuthor('投票ちゃん')
            .setDescription('```/help - 今見てるやつ\n/info - ボット情報等\n/poll - 投票を作成する\n/privacy - Discordデータの取り扱いについて\n/server - このサーバーの情報を表示する```')
            .setFooter('お問い合わせはサポートサーバーまで (https://discord.gg/4gfEnY83nx)')
        console.log(`${chalk.magenta('+ cmd run:')} help / ${interaction.guild.name}[${interaction.guild.id}](${interaction.guild.memberCount}) ${interaction.member.displayName}[${interaction.member.id}]`);
        return interaction.reply({
            embeds: [embed],
            components: [button, ],
        });
    },
};