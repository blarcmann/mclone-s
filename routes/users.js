const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const User = require('../models/User');


// @route   GET api/users
// @desc    Get all users (test route)
// @access  Public
router.get('/', (req, res, error) => {
    res.json({
        message: 'success'
    })
});


// @route   POST api/users/register
// @desc    CREATE new users 
// @access  Public
router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                res.status(400).json({
                    success: false,
                    message: 'email already exists'
                })
            } else {
                const avatar = gravatar.url(req.body.email, {
                    rating: 'r',
                    default: 'mm',
                    size: '200'
                })
                const newUser = new User({
                    name: req.body.name,
                    username: req.body.username,
                    bio: req.body.bio || 'nA',
                    password: req.body.password,
                    email: req.body.email,
                    avatar
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if (error) throw error;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                res.status(201).json({
                                    success: true,
                                    user: user
                                })
                            })
                            .catch(error => {
                                console.log(error);
                                res.status(400).json({
                                    success: false,
                                    message: 'error occured during encryption'
                                })
                            })
                    })
                })
            }
        })
})


// @route   GET api/users/login
// @desc    AUTHENTICATE & LOGIN
// @access  Private

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'user not found'
                })
            }
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = {
                            name: user.name,
                            username: user.username,
                            avatar: user.avatar,
                            id: user._id
                        }
                        jwt.sign(payload, config.secret, { expiresIn: 86400 }, (error, token) => {
                            if (error) {
                                res.status(408).json({
                                    success: false,
                                    message: 'some error occured'
                                })
                            } else {
                                res.status(200).json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                            }
                        })
                    } else {
                        return res.status(400).json({
                            success: false,
                            message: 'Incorrect password'
                        })
                    }
                })
        })
})



module.exports = router;