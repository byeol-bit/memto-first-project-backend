const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const followsRouter = require('./follows');

router.use('/users', usersRouter);
router.use('/follows', followsRouter);

module.exports = router;