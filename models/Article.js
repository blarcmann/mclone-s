const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const ArticleSchema = new Schema({
    title: { type: String, required: true },
    description: {type: String, required: true},
    body: {type: String, required: true},
    feature_img: String,
    favorited: {type: Boolean},
    favorites: [{type: Schema.Types.ObjectId, ref: 'user'}],
    favoritesCount: {type: Number, default: 0},
    claps: {type: Number, default: 0},
    tag: [{type: String, required: true}],
    author: { type: Schema.Types.ObjectId, ref: 'User'},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true})


ArticleSchema.methods.clap = function() {
    this.claps++
    return this.save()
}

ArticleSchema.methods.updateFavoriteCount = function(){
    let article = this;
    return User.count({favorites: {$in: [article._id]}}).then(function(count){
        article.favoritesCount = count;
        return article.save();
    });
};

ArticleSchema.methods.isFavorite = function (id) {
    return this.favorites.some(function (favoriteId) {
        return id.toString() === favoriteId.toString();
    });
};

module.exports = Article = mongoose.model('Article', ArticleSchema);