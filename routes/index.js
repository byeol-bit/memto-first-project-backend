const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const followsRouter = require('./follows');
const restaurantsRouter = require('./restaurants');
const visitsRouter = require('./visits');

router.use('/users', usersRouter);
router.use('/follows', followsRouter);
router.use('/restaurants', restaurantsRouter);
router.use('/visits', visitsRouter);

module.exports = router;