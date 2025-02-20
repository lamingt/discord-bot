import { REST, Routes } from "discord.js";
import "dotenv/config";

const commands = [
  {
    name: "insult",
    description: "Generates a very funny insult.",
  },
  {
    name: "dennis-joke",
    description: "very funny dennis joke",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
