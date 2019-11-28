const express = require('express');
const router = express.Router();
const config = require('../config/keys');
const User = require('../models/User');
const Article = require('../models/Article');
const checkToken = require('../middlewares/check-token');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});

router.get('/', (req, res) => {
    return res.send('it worked bitch!');
})

router.post('/create_article', checkToken, (req, res) => {
    User.findById({ _id: req.body.author })
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'user not found, dummy!'
                })
            }
            if (req.files.feature_img) {
                const file = req.files.feature_img;
                cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
                    if (err) {
                        console.log('error occured while uploading', err);
                        return res.status(501).json({
                            success: false,
                            message: 'error occured while uploading to cloudinary'
                        })
                    }
                    let img_url = result.url;
                    let article = new Article({
                        title: req.body.title,
                        body: req.body.body,
                        description: req.body.title,
                        feature_img: img_url,
                        tags: req.body.tags,
                        author: req.body.author
                    })
                    article.save();
                    res.status(201).json({
                        success: true,
                        message: 'successful',
                        article
                    });
                })
            } else {
                let article = new Article({
                    title: req.body.title,
                    body: req.body.body,
                    description: req.body.title,
                    tags: req.body.tags,
                    author: req.body.author,
                    feature_img: ''
                })
                article.save();
                res.status(201).json({
                    success: true,
                    message: 'successful',
                    article
                });
            }

        })
});

router.get('/count', checkToken, (req, res) => {
    Article.countDocuments({}, (err, totalAr) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'wooo, mii ri ka'
            })
        }
        return res.status(200).json({
            success: true,
            count: totalAr
        })
    })
})


router.get('/article/:id', checkToken, (req, res) => {
    Article.findById({ _id: req.params.id })
        .populate('author')
        .exec((err, article) => {
            if (err) {
                console.log('err occured', err);
                return res.status(500).json({
                    success: false,
                    message: 'error occured'
                })
            }
            if (!article) {
                return res.status(404).json({
                    success: false,
                    message: 'article not found'
                })
            }
            res.status(200).json({
                success: true,
                article
            })
        })
})

router.put('/article/:id', checkToken, (req, res) => {
    Article.findById({ _id: req.params.id }, (err, article) => {
        if (err) {
            console.log('err occured', err);
            return res.status(500).json({
                success: false,
                message: 'error occured'
            })
        }
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'article not found'
            })
        }

        if (req.body.title) article.title = req.body.title;
        if (req.body.body) article.body = req.body.body;
        if (req.body.description) article.description = req.body.description;
        if (req.body.tags) article.tags = req.body.tags;
        article.save();
        res.status(200).json({
            success: true,
            article
        })
    })
})

router.post('/article/:id/clap', (req, res) => {
    Article.findById({ _id: req.params.id }, (err, article) => {
        if (err) {
            console.log('err occured', err);
            return res.status(500).json({
                success: false,
                message: 'error occured'
            })
        }
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'article not found'
            })
        }
        return article.clap().then(() => {
            res.status(200).json({
                success: true,
                article
            })
        })
    })
})

router.delete('/article/:id', checkToken, (req, res) => {
    User.findOne({ _id: req.decoded.user._id }, (err, user) => {
        if (err) {
            console.log('err occured', err);
            return res.status(500).json({
                success: false,
                message: 'error occured'
            })
        }
        Article.findById({ _id: req.params.id }, (err, article) => {
            if (err) {
                console.log('err occured', err);
                return res.status(500).json({
                    success: false,
                    message: 'error occured'
                })
            }
            if (!article) {
                return res.status(404).json({
                    success: false,
                    message: 'article not found'
                })
            }

            if (req.body.author_id.toString() === user._id.toString()) {
                article.remove();
                res.status(200).json({
                    success: true,
                    message: 'article deleted'
                })
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'id does not match'
                })
            }
        })
    })
})

router.get('/all', checkToken, (req, res) => {
    let skip = 0;
    let limit = 10;
    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    }
    if (typeof req.query.skip !== 'undefined') {
        skip = req.query.skip;
    }
    Article.find({})
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('author', 'name _id')
        .sort({ createdAt: 'desc' })
        .exec((err, articles) => {
            if (err) {
                console.log('error occured', err);
                return res.status(500).json({
                    success: false,
                    message: 'internal server error'
                })
            }
            res.status(200).json({
                success: true,
                articles
            })
        })
})


module.exports = router;