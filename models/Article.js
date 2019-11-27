const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    title: { type: String, required: true },
    description: {type: String, required: true},
    body: {type: String, required: true},
    feature_img: String,
    favourites: {type: Number, default: 0},
    tags: [{type: String, required: true}],
    author: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true})


module.exports = Article = mongoose.model('Article', ArticleSchema);