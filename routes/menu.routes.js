const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menu.controller');

router.get('/vendors/:id/menu', menuController.getMeals);

module.exports = router;
