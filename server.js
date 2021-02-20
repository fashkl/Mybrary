const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//import routes 
const indexRouter = require('./routes/index')


//configure our View Engine
app.set('view engine', 'ejs')
//configure to know from where our views it will come
app.set('views', __dirname + '/views')

//hookup express layout
//idea of layout file--> every single file is going to be put inside of this layout file -- we don't have to duplicate begging HTML 
app.set('layout', 'layouts/layout')
app.use(expressLayouts)

//public files --> css, images
app.use(express.static('public'))


mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('Connected to DB!...........'));
const db = mongoose.connection
db.on('error', error => console.error(error))


app.use('/', indexRouter)



app.listen(process.env.PORT || 3000,
    () => { console.log(`Server Up & Running on port ${process.env.PORT}`); })