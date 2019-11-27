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



router.post('/create_article', checkToken, (req, res) => {
    User.findById({ _id: req.body.id })
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'user not found, dummy!'
                })
            }
            if (req.body.feature_img) {
                const file = req.body.feature_img;
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
            }
        })
})


module.exports = router;