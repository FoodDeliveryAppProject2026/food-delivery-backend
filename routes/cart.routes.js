const express = require('express');
const router = express.Router();

const cart = require('../controllers/cart.controllers');

router.post('/add', cart.addToCart);

router.put('/update', cart.updateQuantity);

router.delete('/:order_id/:item_id', cart.removeItem);

router.get('/:order_id/summary', cart.getCartSummary);

router.get('/:order_id', cart.getCart);                
module.exports = router;