const express = require('express')
const author = require('../models/author')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif',]

//all Books route
router.get('/', async (req, res) => {
    let query = Book.find()

    if (req.query.title != null && req.query.title != '' ) {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '' ) {
        query = query.lte('publishedBefore', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '' ) {
        query = query.gte('publishedAfter', req.query.publishedAfter)
    }
    
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

//new Book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

//create Book route
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })

    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    } catch (error) {
        // res.redirect('/books')

        renderNewPage(res, book, true)
    }

})

//Show Book route
router.get('/:id', async(req, res)=>{
    try {
        const book = await Book.findById(req.params.id)
                                .populate('author')
                                .exec()
        res.render('books/show', {book: book})
    } catch (error) {
        res.redirect('/')
    }
})

//Edit Book route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        // res.render('books/edit', { author: author })
        renderEditPage(res, book)
    } catch (error) {
        res.redirect('/books')
    }
})

//Update Book route
router.put('/:id', async (req, res) => {

    let book
    try {
        book = await Book.findById(req.params.id)

        book.title = req.body.title
        book.author = req.body.author
        book.publishedDate = new Date(req.body.publishedDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover)
        }
        await book.save()

        res.redirect(`/books/${book.id}`)
    } catch (error) {
        console.error(error);
        if (book != null) {
            renderEditPage(res, book, true)
        }else{
            res.redirect('/')
        }
    }

})

//Delete Book route
router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        if (book != null) {
            res.render('books/show',{
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book,
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = ' Error Updating Book'
            }else{
                params.errorMessage = ' Error Creating Book'
            }
        }
        res.render(`books/${form}`, params)
    } catch (error) {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded){
    if (coverEncoded == null) return 
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router