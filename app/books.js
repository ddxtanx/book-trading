var https = require('https'),
    mongo = require('mongodb').MongoClient;
var user = process.env.USER;
var password = process.env.PASSWORD;
var mongoUri = "mongodb://"+user+":"+password+"@ds117311.mlab.com:17311/books";
function getBookImage(book, req, res){
    var apiKey = process.env.APIKEY;
    var searchId = process.env.SEARCHID;
    var url = "https://www.googleapis.com/customsearch/v1?key="+apiKey+"&cx="+searchId+"&q="+book+"%20book&num=1"+"&searchType=image";
    console.log(url);
    https.get(url, function(response){
        var bookData = "";
        response.on('data', function(data){
            bookData+=data;
        });
        response.on('end', function(){
            bookData = JSON.parse(bookData);
            if(bookData.error==undefined){
                var url = bookData.items[0].link;
                addBookMongo(book, url, req, res);
            }else{
                res.writeHead(bookData.error.code, {'Content-Type': 'text/plain'});
                res.end(bookData.error.message);
            }
        });
    });
}
function getAllBooks(req, res){
    mongo.connect(mongoUri, function(err,db){
        if(err) throw err;
        var books = db.collection('books');
        var trades = db.collection('trades');
        books.find().toArray(function(err, data){
            if(err) throw err;
            getTrades(data, trades,'all', req, res);
        });
    });
}
function getMyBooks(req, res){
    var email = req.session.email;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var books = db.collection('books');
        var trades = db.collection('trades');
        books.find({
            user: email
        }).toArray(function(err, data){
            if(err) throw err;
            getTrades(data, trades, 'my', req, res);
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
            user: user,
            traded: false
        };
        books.insert(insData, function(err, db){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(url);
        });
    });
}
function delBook(book, req, res){
    console.log("Del request for "+book+" user "+req.session.email);
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var books = db.collection('books');
        var trades = db.collection('trades');
        books.remove({
            name: book,
            user: req.session.email
        }, function(err, data){
            if(err) throw err;
            trades.remove({
                book: book,
                to: req.session.email
            }, function(err, db){
                if(err) throw err;
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify(data));
            });
        });
    });
}
function addTrade(req, res){
    var myUser = req.session.email;
    var userTrading = req.body.forUser;
    var book = req.body.book;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var trades = db.collection('trades');
        var insData = {
          from: myUser,
          to: userTrading,
          book: book,
          completed: false
        };
        trades.insert(insData, function(err, data){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(data));
        });
    });
}
function getTrades(bookData, trades, page, req, res){
    var user = req.session.email;
    trades.find({
        from:user
    }).toArray(function(err, reqData){
        if(err) throw err;
        trades.find({
            to:user
        }).toArray(function(err, recData){
           if(err) throw err;
           var reqBooks = [];
           for(var x = 0; x<reqData.length; x++){
               reqBooks.push(reqData[x].book);
           }
           var accTrades = reqData.filter(function(obj){
               return obj.completed==true&&obj.from==user;
           });
           res.render('twig/'+page+'books.twig', {loggedin: req.session.active, name:req.session.name, email: req.session.email, books: bookData, reqBooks: reqBooks, reqData:reqData, recData: recData, accData: accTrades});
        });
    });
}
function cancel(req, res){
    var book = req.body.book;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var trades = db.collection('trades');
        var books = db.collection('books');
        trades.remove({
            from: req.session.email,
            book: book
        }, function(err, data){
            if(err) throw err;
            books.update({
                name: book
            }, {
                $set: {
                    traded: false
                }
            }, function(err, data){
                if(err) throw err;
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify(data)); 
            });
        });
    });
}
function trade(req, res){
    var me = req.session.email;
    var book = req.body.book;
    var from = req.body.from;
    var action = req.body.action;
    var tradeSearchObject = {
        to: me,
        from: from,
        book: book,
        completed: false
    };
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var trades = db.collection('trades');
        var books = db.collection('books');
        var setData = (action=="accept")?true:false;
        trades.update(tradeSearchObject, {
            $set:{
                completed:setData
            }
        }, function(err, data){
            if(err) throw err;
            if(!setData){
                trades.remove(tradeSearchObject);
            } else{
                books.update({
                    name: book,
                    user: me,
                    traded: false
                }, {
                    $set:{
                        traded:true
                    }
                });
            }
            res.writeHead(200, {'Content-Type':'text/plain'});
            res.end();
        });
    });
}
module.exports.cancel = cancel;
module.exports.getBookImage = getBookImage;
module.exports.getAllBooks = getAllBooks;
module.exports.getMyBooks = getMyBooks;
module.exports.addBookStart = addBookStart;
module.exports.delBook = delBook;
module.exports.addTrade = addTrade;
module.exports.trade = trade;