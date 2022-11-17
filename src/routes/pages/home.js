const router = require("express").Router();
const { guildIcon, guildName } = require('../../../config');

router.get("/", (req, res) => {
  if (req.user) {
      res.render('pages/index', { user: req.user, guildIcon: guildIcon, guildName: guildName });
  } else {
    res.render('pages/index', { guildIcon: guildIcon, guildName: guildName });
  }
});

module.exports = router;
