const db = require('../db');

/*
from menu_items vendor_id , name , description , price , image_url  
order summary subtotal = price * quantity , delivery fee , tax , total subtotal + delivery fee + tax

in orders status = pending 
after checkout status = placed
*/

//add to cart from each meal
exports.addToCart = (req, res) => {

  const { order_id, item_id, quantity } = req.body; 

  const query = `
    INSERT INTO order_items (order_id, item_id, quantity, unit_price)
    SELECT ?, ?, ?, price
    FROM menu_items
    WHERE item_id = ?
  `;

  db.query(query, [order_id, item_id, quantity, item_id], (err) => {
    if(err) return res.status(500).json(err);
    res.json({ message: "Added to cart" });
  });
};

//update quantity
exports.updateQuantity = (req, res) => {

  const { order_id, item_id, quantity } = req.body;

  if(quantity <= 0){
    return res.status(400).json({ message: "Quantity invalid" });
  }

  const query = `
    UPDATE order_items
    SET quantity = ?
    WHERE order_id = ? AND item_id = ?
  `;

  db.query(query, [quantity, order_id, item_id], (err) => {

    if(err) return res.status(500).json(err);

    res.json({ message: "Updated" });
  });
};
//delete from cart
exports.removeItem = (req, res) => {

  const { order_id, item_id } = req.params;

  const query = `
    DELETE FROM order_items
    WHERE order_id = ? AND item_id = ?
  `;

  db.query(query, [order_id, item_id], (err) => {

    if(err) return res.status(500).json(err);

    res.json({ message: "Deleted" });
  });
};
//get cart
exports.getCart = (req, res) => {

  const { order_id } = req.params;

  const query = `
    SELECT 
      oi.item_id,
      oi.quantity,
      oi.unit_price,
      m.name,
      m.description,
      m.image_url
    FROM order_items oi
    JOIN menu_items m ON oi.item_id = m.item_id
    WHERE oi.order_id = ?
  `;

  db.query(query, [order_id], (err, results) => {

    if(err) return res.status(500).json(err);

    res.json(results);
  });
};
exports.getCartSummary = (req, res) => {
  const { order_id } = req.params;

  const query = `
    SELECT quantity, unit_price
    FROM order_items
    WHERE order_id = ?
  `;

  db.query(query, [order_id], (err, items) => {
    if(err) return res.status(500).json(err);

    let subtotal = 0;
    items.forEach(i => {
      subtotal += i.quantity * i.unit_price;
    });
/*
  from the database
  const deliveryFee = 'SELECT delivery_fee FROM vendors WHERE vendor_id = ?;

  or from the user 
  const { deliveryFee } = req.body;
*/
    //or constant
    const deliveryFee = 20;  
    const tax = subtotal * 0.1;     
    const total = subtotal + deliveryFee + tax;

    res.json({
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee,
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  });
};