const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const db = require('./config/keys').mongoURI;
const users = require('./routes/users');
const articles = require('./routes/articles');
const fileUpload = require('express-fileupload');
// const profile = require('./routes/api/profile');
// const posts = require('./routes/api/posts');

const app = express();


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose
    .connect(db)
    .then(() => console.log('Curve the cake'))
    .catch((error) => console.log('ERR', error))

app.get('/', (req, res) => {
    res.send('HELLO');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true
}));
app.use('/api/users', users);
app.use('/api/articles', articles);
// app.use('/api/posts', posts);
// app.use('/api/profile', profile);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`bitch twerking on ${port}`);
})