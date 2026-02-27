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
  if (message.author.bot) return;
  if (!CHANNEL_IDS.includes(message.channel.id)) return;

  const hasLink = /(https?:\/\/[^\s]+)/gi.test(message.content);
  const hasAttachment = message.attachments.size > 0;

  if (!hasLink && !hasAttachment) {
    const warnMsg = await message.reply({
      content: `❌ ${message.author}, ton message doit contenir un lien ou une pièce jointe.`,
    });

    setTimeout(() => {
      warnMsg.delete().catch(() => {});
      message.delete().catch(() => {});
    }, 3000);

    return;
  }

  // 🔥 Supprime embed uniquement si lien
  if (hasLink) {
    message.suppressEmbeds(true).catch(() => {});
  }

  // 🧵 Crée thread
  await message.startThread({
    name: `Discussion - ${message.author.username}`,
    autoArchiveDuration: 60,
  });
});

client.login(TOKEN);
