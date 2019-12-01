const express = require('express');
const Article = require('../models/Article');
const router = express.Router();

router.get('/all', (req, res, next) => {
    Article.find().distinct('tags').then(tags => {
        res.status(200).json({
            success: true,
            tags: tags
        })
    }).catch(next)
});

module.exports = router;
