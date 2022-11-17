const router = require("express").Router();
const passport = require("passport");
const { guildId, roles, prefix } = require('../../../config');

const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();

router.get("/callback", passport.authenticate("discord"), async (req, res) => {
  let arr = [];
  req.user.guilds.forEach((guild) => arr.push(guild.id));

  if (!arr.includes(guildId)) {
    oauth.addMember({
      accessToken: req.user.accessToken,
      botToken: process.env.CLIENT_TOKEN,
      guildId: guildId,
      userId: req.user.discordId,
    });
  }
  res.redirect("/verify");
});

router.get("/", (req, res, next) => {
  if (req.user) {
    res.redirect("/");
  } else {
    passport.authenticate("discord")(req, res, next);
  }
});

module.exports = router;
