const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const User = require('../models/User');
// const Article = require('../models/Article');
const checkToken = require('../middlewares/check-token');


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
                                res.status(400).json({
                                    success: false,
                                    message: `error occured during encryption, ${error}`
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
            } else if (user) {
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (!isMatch) {
                            res.json({
                                success: false,
                                message: 'Password seems incorrect. Authentication failed!'
                            });
                        } else {
                            var token = jwt.sign({ user: user }, config.secret, { expiresIn: '7d' });
                            res.status(200).json({
                                success: true,
                                token: token
                            })
                        }
                    })
            }

        })
})

router.route('/profile')
    .get(checkToken, (req, res, next) => {
        User.findOne({ _id: req.decoded.user._id }, (err, user) => {
            if (err) {
                res.json({
                    success: false,
                    message: `some error occured, try later, ${err}`
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: 'successful',
                    user: user
                });
            }
        })
    })
    .put(checkToken, (req, res, next) => {
        User.findOne({ _id: req.decoded.user._id }, (err, user) => {
            if (err) {
                return next(err);
            }
            if (req.body.name) {
                user.name = req.body.name
            }
            if (req.body.username) {
                user.name = req.body.name
            }
            if (req.body.bio) {
                user.name = req.body.name
            }
            user.save();
            res.status(200).json({
                success: true,
                message: 'update successful'
            });
        })
    })

router.post('/follow/:id', checkToken, (req, res) => {
    User.findById({ _id: req.body.userId }, (err, user) => {
        if (err) {
            console.log('err occured', err);
            return res.status(500).json({
                success: false,
                message: 'error occured'
            })
        }
        if (!user) {
            if (err) {
                console.log('user not found', err);
                return res.status(500).json({
                    success: false,
                    message: 'user not found'
                })
            }
        }
        user.follow(req.params.id);
        return res.status(200).json({
            success: true
        })
    })
})

router.post('/unfollow/:id', checkToken, (req, res) => {
    User.findById({ _id: req.body.userId }, (err, user) => {
        if (err) {
            console.log('err occured', err);
            return res.status(500).json({
                success: false,
                message: 'error occured'
            })
        }
        if (!user) {
            if (err) {
                console.log('err occured', err);
                return res.status(500).json({
                    success: false,
                    message: 'error occured'
                })
            }
        }
        user.unfollow(req.params.id);
        return res.status(200).json({
            success: true
        })
    })
})

module.exports = router;