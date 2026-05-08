const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menu.controllers');

router.get('/vendors/:id/menu', menuController.getMeals);

module.exports = router;
