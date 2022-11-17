const router = require("express").Router();
const fetch = require("node-fetch");
const {
  guildIcon,
  guildName,
  roles,
  guildId,
  prefix,
  link,
  admins,
} = require("../../../config");
const userSchema = require("../../schema/User");
//
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "http://www.rolex-shop.cf/login/callback",
});

const { Client, MessageActionRow, MessageButton } = require("discord.js");
const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await refreshToken();

  setInterval(async () => {
    await refreshToken();
  }, 60 * 60 * 1000);
});
client.login(process.env.CLIENT_TOKEN);
client.on("messageCreate", async (message) => {
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    !message.guild
  )
    return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  const cmd = args.shift().toLowerCase();

  if (cmd == "users") {
    if (!admins.includes(message.author.id)) return;
    let data = (await userSchema.find()) || [];
    console.log(data[5])
    userSchema.count({}, function (err, count) {
      if (err)
        return message.channel.send(`There are **1** authorized members!`);
      message.channel.send(`There are **${count}** authorized members!`);
    });
  } else if (cmd == "button") {
    if (!admins.includes(message.author.id)) return;
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Verify!")
        .setStyle("LINK")
        .setURL(
          `https://discord.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Frolex-shop.cf%2Flogin%2Fcallback&scope=identify%20guilds%20guilds.join&client_id=998967890395021372`
        )
    );

    message.channel.send({
      content: `Click on __**Verify**__ button to get verified role!`,
      components: [row],
    });
  } else if (cmd == "return-members") {
    if (!admins.includes(message.author.id)) return;
    let data = (await userSchema.find()) || [];
    if (data.length < 1)
      return message.channel.send(`There is no members to add!`);

    data.forEach((user) => {
      oauth
        .addMember({
          accessToken: user.accessToken,
          botToken: process.env.CLIENT_TOKEN,
          guildId: message.guild.id,
          userId: user.discordId,
          //roles,
        })
        .then(({ user }) => {
          if (!user) return;
          message.channel.send(
            `I've added \`${
              user.username + "#" + user.discriminator
            }\` to the server`
          );
        })
        .catch((e) => {
          message.channel.send(`An error occurred: \`\`\`${e}\`\`\``);
        });
    });
  }
});

router.get("/", async (req, res) => {
  if (req.user) {
    const guild = client.guilds.cache.get(guildId);

    await guild.members
      .fetch(req.user.discordId)
      .then((m) => roles.forEach((r) => m.roles.add(r)));
    res.render("pages/verify", {
      name: req.user.discordName,
      guildIcon: guildIcon,
      guildName: guildName,
    });
  } else {
    res.redirect("/login");
  }
});

module.exports = router; //

async function refreshToken() {
  let data = (await userSchema.find()) || [];
  if (data.length < 1) return;
  
  data.forEach(async (user) => {
  await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${user.refreshToken}`,
  }).then(async (res) => {
    let data = await res.json();
    if (data.error) {
      console.log(user.discordId)
      return await userSchema.deleteOne({ discordId: user.discordId });
    }
    
    await userSchema.updateOne(
      { discordId: user.discordId },
      { accessToken: data.access_token, refreshToken: data.refresh_token },
      { new: true }
    );
  });
  });
  /*oauth
    .tokenRequest({
      grantType: "refresh_token",
      scope: ["identify", "guilds", "guilds.join"],
      refreshToken: user.refreshToken,
    })
    .then(async (data) => {
      if (data.error || typeof data.access_token == "undefined") {
        console.log()
        console.log(user.discordId);
        await userSchema.deleteOne({ accessToken: user.accessToken });
        return;
      }

      await userSchema.updateOne(
        { discordId: user.discordId },
        { accessToken: res.access_token, refreshToken: res.refresh_token }
      );
    })
    .catch(async () => {
      console.log(user.discordId);
      await userSchema.deleteOne({ accessToken: user.accessToken });
      return;
    });
  */
}
