import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

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
    if (message.channel.id !== CHANNEL_ID) return;

    const hasLink = /(https?:\/\/[^\s]+)/gi.test(message.content);

    // ✅ CAS AVEC LIEN → créer thread
    if (hasLink) {
      if (!message.hasThread) {
        await message.startThread({
          name: `Discussion - ${message.author.username}`,
          autoArchiveDuration: 60, // 1h
        });
      }
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
