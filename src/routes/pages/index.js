const router = require('express').Router();

const home = require('./home');
const discord = require('./discord');
const verify = require('./verify');

router.use('/', home);
router.use('/discord', discord);
router.use('/verify', verify);

module.exports = router;