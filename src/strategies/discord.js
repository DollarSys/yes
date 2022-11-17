const User = require("../schema/User");

const passport = require("passport");
const DiscordStrategy = require("passport-discord");

passport.serializeUser((user, done) => {
  done(null, user.discordId);
});

passport.deserializeUser(async (discordId, done) => {
  try {
    const user = await User.findOne({
      discordId,
    });
    return user ? done(null, user) : done(null, null);
  } catch (err) {
    console.log(err);
    done(err, null);
  }
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CLIENT_CALLBACK_REDIRECT,
      scope: ["identify", "guilds", "guilds.join"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, username, guilds } = profile;

      try {
        const findUser = await User.findOneAndUpdate(
          {
            discordId: id,
          },
          {
            username,
            accessToken,
            refreshToken,
            guilds,
          },
          {
            new: true,
          }
        );

        if (findUser) {
          return done(null, findUser);
        } else {
          const newUser = await User.create({
            discordId: id,
            discordName: username,
            accessToken,
            refreshToken,
            guilds,
          });

          return done(null, newUser);
        }
      } catch (err) {
        console.log(err);
        return done(err, null);
      }
    }
  )
);
