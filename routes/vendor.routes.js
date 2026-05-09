const express = require('express');
const router = express.Router();

const homeController = require('../controllers/vendors.controller');

router.get('/vendors', (req,res)=>{
    homeController.getVendors(req,res);
});

module.exports = router;