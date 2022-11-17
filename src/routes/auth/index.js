const router = require('express').Router();

const login = require('./login');
const logout = require('./logout');

router.use('/login', login);
router.use('/logout', logout);

module.exports = router;