var https = require('https'),
    mongo = require('mongodb').MongoClient;
var user = process.env.USER;
var password = process.env.PASSWORD;
var mongoUri = "mongodb://"+user+":"+password+"@ds117311.mlab.com:17311/books";
function getBookImage(book, req, res){
    var apiKey = process.env.APIKEY;
    var searchId = process.env.SEARCHID;
    var url = "https://www.googleapis.com/customsearch/v1?key="+apiKey+"&cx="+searchId+"&q="+book+" book&num=1"+"&searchType=image";
    https.get(url, function(response){
        var bookData = "";
        response.on('data', function(data){
            bookData+=data;
        });
        response.on('end', function(){
            bookData = JSON.parse(bookData);
            var url = bookData.items[0].link;
            addBookMongo(book, url, req, res);
        });
    });
}
function getAllBooks(req, res){
    mongo.connect(mongoUri, function(err,db){
        if(err) throw err;
        var books = db.collection('books');
        books.find().toArray(function(err, data){
            if(err) throw err;
            res.render('twig/allbooks.twig', {loggedin: true, name: req.session.name, data: data});
        });
    });
}
function getMyBooks(req, res){
    var email = req.session.email;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var books = db.collection('books');
        books.find({
            user: email
        }).toArray(function(err, data){
            if(err) throw err;
            console.log(data);
            res.render('twig/mybooks.twig', {loggedin: true, name: req.session.name, data: data});
        });
    });
}
function addBookStart(req, res){
    var book = req.body.bookName;
    getBookImage(book, req, res);
}
function addBookMongo(book, url, req, res){
    var user = req.session.email;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var books = db.collection('books');
        var insData = {
            name: book,
            url: url,
            user: user
        };
        books.insert(insData, function(err, db){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(url);
        });
    });
}
function delBook(book, req, res){
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var books = db.collection('books');
        books.remove({
            name: book,
            user: req.session.email
        }, function(err, data){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(data));
        })
    })
}
module.exports.getBookImage = getBookImage;
module.exports.getAllBooks = getAllBooks;
module.exports.getMyBooks = getMyBooks;
module.exports.addBookStart = addBookStart;
module.exports.delBook = delBook;