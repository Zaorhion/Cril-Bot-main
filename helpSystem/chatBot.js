const Discord = require("discord.js");

const AnswerZero = require("./answerLevelZero");

const { questionPicker } = require("./questionPicker");
const { filter } = require("./filter");

module.exports = class chatBot {
  /**
   *
   * @param {Discord.Message} msg
   */
  constructor(msg) {
    this.msg = msg;
    this.channel = msg.channel;
    /**
     *  The Embed message
     *
     * @type {Discord.MessageEmbed}
     * @public
     */
    this.msg_embed = msg.msg_embed;

    /**
     * The answer array return by the questionPicker
     *
     * @type {Array<Array<String, Number, String>>}
     * @public
     */
    this.answer_array;
    this.step = 0;
    this.__init__(msg);
  }

  /**
   * Main Component of the ChatBot system
   * Launcher of the auto-answers
   *
   * @param {Discord.Message} msg
   */
  async __init__(msg) {
    this.answer_array = await questionPicker(msg.content);
    if (this.answer_array[0][1] > 20) return; // Deny if the answers found are too far from the question

    let user_filter = await filter(msg, this.answer_array[0][2]);
    if (!user_filter) return; // Deny if WrongChannel, Admin, talkedRecently,

    this.__selector__(this.step);
  }

  async __selector__(step) {
    let level = 0;
    switch (this.answer_array[step][2]) {
      case "FIND_MOODLE":
        this.msg_embed = await AnswerZero.find_moodle(this.msg, true);
        break;
      case "FIND_RESACRIL":
        this.msg_embed = await AnswerZero.find_ResaCril(this.msg, true);
        break;
      case "FIND_FICHE":
        this.msg_embed = await AnswerZero.find_fiche(this.msg, true);
        break;
      case "VALIDATION_TIME_ACTIVITY":
        this.msg_embed = await AnswerZero.find_Validation(this.msg, true);
        break;
      case "DELAY":
        level = 1;
        break;
      case "PREVIOUS_ABSENCE":
        level = 1;
        break;
      case "FIND_ACTIVITY":
        this.msg_embed = await this.msg.reply("SALUT TOI");
        level = 2;
        break;
      case "UNSUBSCRIBE":
        level = 2;
        break;
      case "DISCORD_CONNECT":
        level = 2;
        break;
    }

    if (!this.msg_embed) return;
    this.buttonCollector(this.msg, this.msg_embed, level);
  }

  /**
   *
   * @param {Discord.Message} msg_user
   * @param {Discord.Message} msg_bot
   */
  buttonCollector(msg_user, msg_bot, level) {
    const filter = (interaction) =>
      interaction.user.id === msg_user.author.id && interaction.isButton();
    const collector = msg_bot.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 20,
      errors: ["time"],
    });

    collector.on("collect", async (i) => {
      switch (i.customId) {
        case "Happy":
          if (level === 0) {
            msg_user.reply("Merci d'avoir répondu !");
          } else {
            this.__launcher__();
          }
          break;
        case "Unhappy":
          if (this.step === 2) {
            msg_user.reply(
              "Je n'ai plus de réponse à vous apporter, merci de contacter un @Responsable !"
            );
          } else {
            this.step = this.step + 1;
            msg_user.reply("Je m'occupe de vous. . .").then((m) => {
              setTimeout(() => {
                m.delete();
              }, 1000 * 3);
            });
            this.msg_embed.delete();
            this.__selector__(this.step);
          }
          break;
      }

      await i.deferUpdate();
    });

    collector.on("end", (collected, reason) => {});
  }

  __launcher__() {
    if (this.step === 0) {
    } else {
    }
  }
};
