const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const restaurantsRouter = require('./restaurants');

router.use('/users', usersRouter);

router.use('/restaurants', restaurantsRouter);

module.exports = router;