const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const CommentSchema = new Schema({
    body: { type: String, required: true },
    author: { ref: 'User', type: Schema.Types.ObjectId },
    article: { ref: 'Article', type: Schema.Types.ObjectId }
}, { timestamps: true })

module.exports = Comment = mongoose.model('Comment', CommentSchema);