import { Client, IntentsBitField } from "discord.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`${c.user.tag} is online.`);
});

const messages = [];
client.on("messageCreate", async (msg) => {
  messages.push({
    author: msg.author.displayName,
    content: msg.content,
  });
  if (msg.author.bot) return;

  if (msg.content.includes("@everyone")) {
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json");
        const data = await res.json();
        msg.reply(data.insult);
      } catch (error) {
        msg.reply("There was an error: ", error);
      }
    }
  } else if (msg.author.id === process.env.TARGET_PERSON || msg.content === "test") {
    try {
      const res = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json");
      const data = await res.json();

      const emojiRes = await fetch("https://api.api-ninjas.com/v1/emoji?group=smileys_emotion", {
        headers: { "X-Api-Key": process.env.EMOJI_API_KEY },
      });
      const emoji = await emojiRes.json();
      const randomIndex = Math.floor(Math.random() * emoji.length);

      msg.reply(`${data.insult} ${emoji[randomIndex].character}`);
    } catch (error) {
      msg.reply("There was an error");
    }
  } else {
    // Trying multiple times to avoid the free api's safety restrictions
    const maxTries = 10;
    for (let tries = 0; tries < maxTries; tries++) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEN_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt =
          "You are a bot called the Dennis Hater 9000. You are currently " +
          "in a group chat, and this message was sent: " +
          `\"${msg.content}\"` +
          "\n" +
          "Respond to this message, keeping in mind that you are a bot and this " +
          "message may not be directed at you. Keep an informal tone and act a tiny bit silly. " +
          "For context, here are the last messages in the group chat in object form. " +
          "Remember, your name is dennis hater 9000 in these messages in JSON object form. " +
          "Respond in context with these messages. Dont send any of the message history. " +
          "Don't put quotation marks around your message\n";
        for (const m of messages) {
          prompt += JSON.stringify(m) + "\n";
        }
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        msg.reply(text);
        break;
      } catch (error) {
        console.log(error);
      }
    }
  }

  if (Math.floor(Math.random() * 1000) === 69) {
    msg.reply("Buy a lottery ticket");
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "insult") {
    try {
      const res = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json");
      const data = await res.json();
      interaction.reply(`${data.insult}`);
    } catch (error) {
      interaction.reply("There was an error: ", error);
    }
  }

  if (interaction.commandName === "dennis-joke") {
    await interaction.deferReply();
    const maxTries = 5;
    for (let tries = 0; tries < maxTries; tries++) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEN_API_KEY);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = 
        "Write a paragraph-long funny joke about a man named Dennis. Here are some things about him: " +
        "He loves drinking and going to wild parties. " +
        "People call him a silly nickname. " +
        "He has a long-time rival who always seems to be against him. " +
        "He was once part of a student organization but got kicked out. " +
        "He doesn't take studying seriously and often trolls his exams. " +
        "He also loves using the word 'beyond' excessively.";
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const emojiRes = await fetch("https://api.api-ninjas.com/v1/emoji?group=smileys_emotion", {
          headers: { "X-Api-Key": process.env.EMOJI_API_KEY },
        });
        const emoji = await emojiRes.json();

        const randomEmojis = Array.from({ length: 5 }, () => {
          return emoji[Math.floor(Math.random() * emoji.length)].character;
        });

        await interaction.editReply(`${text} ${randomEmojis.join(" ")}`);
        break;
      } catch (error) {
        console.log(error);
      }
    }
  }
});

client.login(process.env.TOKEN);
