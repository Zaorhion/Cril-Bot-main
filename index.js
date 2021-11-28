require("require-sql");

const { client } = require("./utils/client"); //Client object
const { con } = require("./utils/mysql");

const { TOKEN } = require("./token.json"); // ¨Private token
const { PREFIX } = require("./config.json"); // Prefix

const { cmdGrabber } = require("./commands/commandsGrabber"); // Manager / Launcher for the commands
const Entry = require("./entry/entry"); // Manager for the entry system

const { pollRequest } = require("./commands/poll");
const Reminder = require("./commands/remindMe");

const { questionPicker } = require("./helpSystem/levenshteinDis");
const chatBot = require("./helpSystem/chatBot");

/** Wake up on ready state */
client.on("ready", async () => {
  console.log(`Logged into: ${client.user.tag}`);

  con.connect(function (err) {
    if (err) console.log(err);
    console.log("Connected to database as ID : " + con.threadId);
    Reminder.remindCheck();
  });
});

/** Wake up on message sent */
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.author.id === client.user.id) return;
  if (msg.content.startsWith(PREFIX)) {
    cmdGrabber(msg);
  }

  try {
    let delta = await questionPicker(msg.content);
    console.log(delta);
    msg.reply(
      `Question trouvée : ${delta[0][0]} avec un indice d'approche de ${delta[0][1]} dans le domaine ${delta[0][2]}`
    );
    if (delta[0][2] === "FIND_MOODLE") {
      chatBot.find_moodle(msg, delta);
    }
  } catch (err) {
    console.log(err);
  }
});

/** Wake up on reaction added */
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  let msg = await reaction.message.channel.messages.fetch(reaction.message.id);
  if (!msg.author.bot) return;
  await pollRequest(reaction);
});

/** Wake up on reaction removed */
client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  let msg = await reaction.message.channel.messages.fetch(reaction.message.id);
  if (!msg.author.bot) return;
  await pollRequest(reaction);
});

/** Wake up on new member income */
client.on("guildMemberAdd", (member) => {
  if (member.user.bot) return;
  if (member.user.id === client.user.id) return;
  new Entry(member);
});

/** Login on token */
client.login(TOKEN);
