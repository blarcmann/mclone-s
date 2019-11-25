const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    username: {type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    password: { type: String, required: true },
    avatar: { type: String },
    articles : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    favorites : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = User = mongoose.model('users', UserSchema);
