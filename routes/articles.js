const express = require('express');
const router = express.Router();
const config = require('../config/keys');
const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const checkToken = require('../middlewares/check-token');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});

router.get('/', (req, res) => {
    return res.send('it worked!');
})

router.post('/article/:id/fav', checkToken, (req, res) => {
    User.findById({ _id: req.body.userId }, (err, user) => {
        if (err) {
            console.log('error occured', err);
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
        user.favorite(req.params.id);
        return res.status(200).json({
            success: true
        })
    })
})

router.post('/article/:id/updateFavorites', checkToken, (req, res) => {
    Article.findById({ _id: req.params.id }, (err, article) => {
        if (err) {
            console.log('error occured', err);
            return res.status(500).json({
                success: false,
                message: 'error occured'
            })
        }
        if (!article) {
            if (err) {
                console.log('user not found', err);
                return res.status(500).json({
                    success: false,
                    message: 'article not found'
                })
            }
        }
        const foundUser = article.favorites.filter(id => id == req.body.userId);
        if (foundUser[0]) {
            return;
        } else {
            article.favorites.push(req.body.userId);
        }
        article.save();
        return res.status(200).json({
            success: true
        })
    })
})

router.post('/article/:id/removeFavorites', checkToken, (req, res) => {
    Article.findById({ _id: req.params.id }, (err, article) => {
        if (err) {
            console.log('error occured', err);
            return res.status(500).json({
                success: false,
                message: 'error occured'
            })
        }
        if (!article) {
            if (err) {
                console.log('user not found', err);
                return res.status(500).json({
                    success: false,
                    message: 'article not found'
                })
            }
        }
        if (article.favorites && article.favorites.length !== 0) {
            for (let i = 0; i < article.favorites.length; i++) {
                if (article.favorites[i] == req.decoded.user._id) {
                    article.favorites.splice(i, 1);
                }
            }
        }
        article.save();
        return res.status(200).json({
            success: true
        })
    })
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
                        tag: req.body.tag,
                        description: req.body.description,
                        feature_img: img_url,
                        favorited: false,
                        author: req.body.author
                    });
                    user.authorize(article._id);
                    article.save();
                    return res.status(201).json({
                        success: true
                    });
                })
            } else {
                let article = new Article({
                    title: req.body.title,
                    body: req.body.body,
                    description: req.body.description,
                    tag: req.body.tag,
                    favorited: false,
                    author: req.body.author,
                    feature_img: ''
                })
                article.save();
                res.status(201).json({
                    success: true,
                });
            }

        })
});

router.post('/article/:id/comment', checkToken, (req, res) => {
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
        let comment = new Comment({
            body: req.body.body,
            author: req.body.author,
            article: req.body.article
        });
        comment.save();
        article.comments.push(comment);
        article.save();
        return res.status(201).json({
            success: true
        })
    })
})

router.get('/article/:id/comments', (req, res) => {
    Article.findById({ _id: req.params.id })
        .populate({
            path: 'comments',
            populate: { path: 'author', select: 'name _id avatar' },
            options: { sort: { createdAt: 'desc' } }
        })
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
            return res.status(200).json({
                success: true,
                comments: article.comments
            })
        })
})

router.post('/article/:id/:comment', checkToken, (req, res) => {
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
                console.log('err occured ', err);
                return res.status(500).json({
                    success: false,
                    message: 'error occured'
                })
            }
            Comment.deleteOne({ _id: req.body.comment_id })
                .then(comments => {
                    article.comments.remove(req.body.comment_id)
                    article.save();
                    res.status(200).json({
                        success: true
                    })
                }).catch(err => {
                    console.log('err occured ', err);
                    return res.status(500).json({
                        success: false,
                        message: 'error occured'
                    })
                })
        })
    })
})

router.get('/article/:id', (req, res) => {
    Article.findById({ _id: req.params.id })
        .populate('author', '_id name username avatar')
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
        if (article.favorites && article.favorites.length !== 0) {
            article.favorites.forEach(fav => {
                if (fav === req.decoded.user._id) {
                    return article.favorited = true;
                } else {
                    return article.favorited = false;
                }
            })
        }

        if (req.body.title) article.title = req.body.title;
        if (req.body.body) article.body = req.body.body;
        if (req.body.description) article.description = req.body.description;
        if (req.body.tag) article.tag = req.body.tag;
        article.save();
        res.status(200).json({
            success: true,
            article
        })
    })
})

router.post('/article/:id/clap', checkToken, (req, res) => {
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
        article.clap();
        article.save();
        return res.status(200).json({
            success: true,
            article
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

router.get('/count', (req, res) => {
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

router.get('/all', (req, res) => {
    let skip = 0;
    let limit = 10;
    let query = {};
    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    }
    if (typeof req.query.skip !== 'undefined') {
        skip = req.query.skip;
    }
    if (typeof req.query.skip !== 'undefined') {
        skip = req.query.skip;
    }
    if (typeof req.query.tag !== 'undefined') {
        query.tag = { "$in": [req.query.tag] };
    }
    Article.find(query)
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('author', '_id username')
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