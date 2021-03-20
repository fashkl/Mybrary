if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')

const logger = require('morgan')
const cors = require('cors')

//import routes 
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')


app.use(logger('dev'))
app.use(cors())

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

app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('Connected to DB!...........'));
const db = mongoose.connection
db.on('error', error => console.error(error))


app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)



app.listen(process.env.PORT || 3000,
    () => { console.log(`Server Up & Running on port ${process.env.PORT}`); })