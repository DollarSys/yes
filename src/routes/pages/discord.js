const router = require("express").Router();
const { discordLink } = require('../../../config');

router.get("/", (req, res) => {
    res.redirect(discordLink);
});

module.exports = router;
