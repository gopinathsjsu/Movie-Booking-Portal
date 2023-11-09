const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// register a new user
router.post('/register', async (req, res) => {
    
    try {

        // check if user already exist
        const userExist = await User.findOne({email: req.body.email});
        if(userExist) {
            return res.send({
                success: false,
                message: "User already exists",
            })
        }

        // hash the password 
        const salt = await bcrypt.getSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        //save the user
        const newUser = new User(req.body);
        await newUser.save();

        res.send({
            success: true,
            message: "User create successfully"
        });

    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }

});

// login a user
router.post('/login', async (req, res) => {
    try{
        // check if user exists
        const user = await User.findOne({ email: req.body.email });
        if(!user) {
            return res.send({
                success: false,
                message: 'User does not exist',
            })
        }
        // check if password is correct
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) {
            return res.send({
                success: false,
                message: 'Invalid Password',
            });
        }

        // create and assign a token
        const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, {
            expiresIn:'1d',
        });
        res.send({ success: true, message: "User logged in successfully", data: token});
    }catch(error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
})

module.exports = router;