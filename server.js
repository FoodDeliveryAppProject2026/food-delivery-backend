const mysql = require('mysql2');
const cors = require('cors');
const express = require('express');
const app = express();

//it allows to show data in json
app.use(express.json());
//it allows back-end to communicate with front-end
app.use(cors({
    origin:'http://localhost:3000'
}));

//load .env variables
require('dotenv').config();

//import routes
const authRoutes = require('./routes/routes_auth');
app.use('/auth', authRoutes);

//listen on port 3000
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`http://localhost:${port}/`);
});
