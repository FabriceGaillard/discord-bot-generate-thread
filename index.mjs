import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_IDS =
  process.env.CHANNEL_IDS?.split(',')
    .map((id) => id.trim())
    .filter(Boolean) ?? [];

if (!TOKEN) {
  console.error('DISCORD_TOKEN manquant');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot prêt (${client.user?.tag})`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (!CHANNEL_IDS.includes(message.channel.id)) return;

    const hasLink = /(https?:\/\/[^\s]+)/gi.test(message.content);

    // ✅ CAS AVEC LIEN → créer thread
    if (hasLink) {
      setTimeout(() => {
        message.suppressEmbeds(true).catch(() => {});
      }, 300);

      await message.startThread({
        name: `Discussion - ${message.author.username}`,
        autoArchiveDuration: 60,
      });

      return;
    }

    // ❌ PAS DE LIEN → message temporaire
    const warnMsg = await message.reply({
      content: `❌ **${message.author.username}**, ton message doit contenir un lien.`,
      ephemeral: true,
    });

    await message.delete();

    setTimeout(() => warnMsg.delete().catch((e) => console.error(e)), 3000);
  } catch (err) {
    console.error('Erreur:', err);
  }
});

client.login(TOKEN);
