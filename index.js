const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const db = process.env.DB_URI;
const users = require('./routes/users');
const articles = require('./routes/articles');
const tags = require('./routes/tags');
const fileUpload = require('express-fileupload');

const app = express();
app.use(cors());

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log('Curve the cake'))
    .catch((error) => console.log('ERR', error))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true
}));

app.use('/api/users', users);
app.use('/api/articles', articles);
app.use('/api/tags', tags);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`twerking on ${port}`);
})