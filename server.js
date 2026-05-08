const mysql = require('mysql2');
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
//it allows to show data in json
app.use(express.json());
//it allows back-end to communicate with front-end

app.use(cors({
    origin:'http://localhost:3000'
}));

//app.use(cors());

//load .env variables
require('dotenv').config();

//import routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);
//for home page
const homeRoutes = require('./routes/vendors.routes');
app.use('/home', homeRoutes);
//for menu page
const menuRoutes = require('./routes/menu.routes');
app.use('/home', menuRoutes);
//for cart page
const cartRoutes = require('./routes/cart.routes');
app.use('/cart', cartRoutes);

//listen on port 3000
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`http://localhost:${port}/`);
});
