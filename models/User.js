const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Article = require('./Article');


const UserSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    password: { type: String, required: true },
    avatar: { type: String },
    articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });


UserSchema.methods.follow = function (id) {
    if (this.following.indexOf(id) === -1) {
        this.following.push(id);
    }
    return this.save();
};

UserSchema.methods.unfollow = function (id) {
    this.following.remove(id);
    return this.save();
};

UserSchema.methods.isFollowing = function (id) {
    return this.following.some(function (followId) {
        return id.toString() === followId.toString();
    });
};

UserSchema.methods.favorite = function (id) {
    if (this.favorites.indexOf(id) === -1) {
        this.favorites.push(id);
    }
    return this.save();
};

UserSchema.methods.unfavorite = function (id) {
    this.favorites.remove(id);
    return this.save();
};

UserSchema.methods.isFavorite = function(id){
    return this.favorites.some(function(favoriteId){
        return id.toString() === favoriteId.toString();
    });
};

module.exports = User = mongoose.model('User', UserSchema);

