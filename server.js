var express = require('express'),
    app = express(),
    sessions = require('client-sessions'),
    account = require('./app/account.js'),
    bodyParser = require('body-parser'),
    books = require('./app/books.js');

app.set('views', './public');
app.use(express.static('./public'), sessions({
  cookieName: 'session',
  secret: process.env.SESSION_SECRET,
  duration: 30 * 60 * 1000,
  activeDuration: 30 * 60 * 1000,
}), bodyParser());
app.get("/*", function(req, res, next){
   if(req.session.active==undefined){
       req.session.active = false;
       req.session.name = "";
   } 
   next();
});
function checkIn(req, res, callback){
    if(!req.session.active){
        console.log("Catching attempted visit without login");
        res.redirect('/login');
        res.end();
    }else {
        callback();
    }
}
app.get("/", function(req, res){
    res.render('twig/index.twig', {loggedin: req.session.active, name: req.session.name});
});
app.get("/register", function(req, res){
    res.render("twig/register.twig", {loggedin: req.session.active, name: req.session.name});
});
app.get("/login", function(req, res){
    res.render("twig/login.twig", {loggedin: req.session.active, name: req.session.name});
});
app.post("/register", function(req, res){
    account.reg(req, res);
});
app.post("/login", function(req, res){
    account.login(req, res);
});
app.get("/settings", function(req, res){
    checkIn(req, res, function(){
        res.render("twig/settings.twig", {loggedin: true, name: req.session.name});
    });
});
app.post("/settings", function(req, res){
    checkIn(req, res, function(){
        if(req.body.city!==undefined || req.body.state!==undefined){
            console.log("cityUp");
            account.updateCity(req, res);
        } else{
            console.log("passUp");
            account.updatePassword(req, res);
        }
    });
});
app.get("/allbooks", function(req, res){
    checkIn(req, res, function(){
        books.getAllBooks(req, res);
    });
});
app.get("/mybooks", function(req,res){
    checkIn(req, res, function(){
        books.getMyBooks(req, res);
    });
});
app.post("/mybooks", function(req, res){
    checkIn(req, res, function(){
        books.addBookStart(req, res);
    });
});
app.post("/delBook", function(req, res){
    checkIn(req, res, function(){
        var book = req.body.book;
        books.delBook(book, req, res);
    });
});
app.post("/trade", function(req, res){
    checkIn(req, res, function(){
        books.addTrade(req, res);
    });
});
app.post("/cancel", function(req, res){
    checkIn(req, res, function(){
        books.cancel(req, res);  
    });
});
app.post("/trades", function(req, res){
   checkIn(req, res, function(){
        books.trade(req, res);
   }); 
});
app.get("/logout", function(req, res){
   req.session.reset();
   req.session.active = false;
   res.redirect("/");
   res.end();
});
app.listen(process.env.PORT || 8080);