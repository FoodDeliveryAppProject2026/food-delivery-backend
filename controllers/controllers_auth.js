const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const createToken = (user) => {
    console.log('JWT_EXPIRES_TIME:', process.env.JWT_EXPIRES_TIME); 
    return jwt.sign({userId : user}, process.env.JWT_SECRET
        ,{expiresIn: process.env.JWT_EXPIRES_TIME}
    );
}
//Sign Up first & last name , email , passward
exports.register = async (req,res)=>{
    try {
        const {first_name, last_name, email, password} = req.body;

        if (!email || !password)
            return res.status(400).send("Email and password are required")

        //check if user exists 
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).send({ message: err.message })
            if (results.length > 0) {
                return res.status(400).send("Wrong email or password") //email already exists
            }
        //hash password
        const hashPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (first_name, last_name ,email, password_hash) VALUES (?, ?, ?, ?)', [first_name, last_name ,email, hashPassword], (err , result) => {
                if (err) return res.status(500).send({ message: err.message })
                //jwt token
                const token = createToken(result.insertId);
                res.status(200).json({message: 'Registered successfully', token});
            })
        
        })
    } catch (err) {
        res.status(500).send({message: err.message});
    }

}
//sign in email & password 
exports.login = async (req,res)=>{
    try {
        const {email, password} = req.body; 
        
        if (!email || !password)
            return res.status(400).send("Email and password are required")

        //check if user exists & check password correct
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).send({ message: err.message })
            if (results.length === 0) {
                return res.status(400).send("Wrong email or password") //email not exists
            }
        //check password validation
        const findUser = results[0];
        const validPassword = await bcrypt.compare(password, findUser.password_hash);
        if (!validPassword) {
            return res.status(400).send({message: 'Wrong email or password'});
        }
        const token = createToken(findUser.user_id);
        res.status(200).json({message: 'Login successful', token});
        })
    } catch (err) {
        res.status(500).send({message: err.message});
    }
}