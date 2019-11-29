const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Article = require('./Article');


const UserSchema = new Schema({
    name: { type: String, required: true },
    username: {type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    password: { type: String, required: true },
    avatar: { type: String },
    articles : [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    favorites : [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps: true});

module.exports = User = mongoose.model('User', UserSchema);

