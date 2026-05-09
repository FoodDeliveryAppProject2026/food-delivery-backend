const express = require('express');
const router = express.Router();

const homeController = require('../controllers/vendors.controller');

router.get('/vendors', homeController.getVendors);

module.exports = router;