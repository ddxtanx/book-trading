var mongo = require('mongodb').MongoClient;
var user = process.env.USER;
var password = process.env.PASSWORD;
var mongoUri = "mongodb://"+user+":"+password+"@ds117311.mlab.com:17311/books";
console.log(mongoUri)
function reg(req, res){
    var email = req.body.email;
    var name = req.body.name;
    var pass1 = req.body.pass1;
    var pass2  = req.body.pass2;
    if(pass1!==pass2){
        res.render("twig/register.twig", {type: "alert-danger", text:"Passwords do not match"});
    }
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var users = db.collection('users');
        users.find({
            'email': email
        }).toArray(function(err, data){
            if(err){
                res.render("twig/register.twig", {type: "alert-danger", text:"Database error"});
                db.close();
            }
            if(data.length!==0){
                res.render("twig/register.twig", {type: "alert-danger", text:"You are already registered!<a href='/login'>Now Login! </a>"});
                db.close();
            } else{
                var user = {
                    'email': email,
                    'name': name,
                    'password': pass1,
                    'city': '',
                    'state': ''
                };
                users.insert(user, function(err, data){
                    if(err){
                        res.render("twig/register.twig", {type: "alert-danger", text:"Database error"});
                        db.close();
                    }
                    console.log(data);
                    res.render("twig/register.twig", {type: "alert-success", text:"You have been registered!"});
                    db.close();
                });
            }
        });
    })
}
function login(req, res){
    var email = req.body.email;
    var password = req.body.password;
    console.log(email+' '+password)
    mongo.connect(mongoUri, function(err, db){
        console.log("Connected to db");
       if(err){
           res.render("twig/login.twig", {type: "alert-danger", text:"DB error"});
       } 
       var users = db.collection('users');
       users.find({
           'email': email,
           'password': password
       }).toArray(function(err, data){
           console.log("Got data");
           if(err){
               res.render("twig/login.twig", {type: "alert-danger", text:"DB error", loggedin:false});
           } 
           console.log(data);
           if(data.length===0){
               console.log("No users");
               res.render("twig/login.twig", {type: "alert-danger", text:"Email&Password combo not found.", loggedin:false});
           } else{
               console.log("Got user");
               console.log(data);
               req.session.active = true;
               req.session.email = data[0].email;
               req.session.name = data[0].name;
               req.session.password = data[0].password;
               res.redirect("/");
               res.end();
               db.close();
           }
       });
    });
}
function updateCity(req, res){
    var userData = {
        loggedin: true,
        name: req.session.name
    }
    var state = req.body.state;
    var city = req.body.city;
    console.log(state+" "+city)
    var email = req.session.email;
    var insData;
    if(state==""&&city!==""){
        insData = {
          city: city  
        };
    } else if(state!==""&&city==""){
        insData = {
            state: state
        };
    }else{
        insData = {
            city: city,
            state: state
        };
    }
    console.log(JSON.stringify(insData));
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var users = db.collection('users');
        users.update({
            email: email
        }, {
            $set:insData
        }, function(err, data){
            if(err) throw err;
            res.render('twig/settings.twig', Object.assign({type:"alert-success", message:"Successfully Changed City&State Data"}, userData));
        });
    });
}
function updatePassword(req, res){
    var userData = {
        loggedin: true,
        name: req.session.name
    }
    var oldPass = req.session.password;
    var inputtedCurPass = req.body.curpass;
    var newPass1 = req.body.pass1;
    var newPass2 = req.body.pass2;
    if(newPass1!=newPass2){
        res.render('twig/settings.twig', Object.assign({type: "alert-danger", message:"Your New Passwords Do Not Match"}, userData));
        return;
    }
    if(oldPass!=inputtedCurPass){
        res.render('twig/settings.twig', Object.assign({type: "alert-danger", message:"Incorrect Password"}, userData));
        return;
    }
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var users = db.collection('users');
        users.update({
            email: req.session.email,
            password: inputtedCurPass
        }, {
            $set:{
                password: newPass1
            }
        }, function(err, data){
            if(err) throw err;
            req.session.password = newPass1;
            res.render('twig/settings.twig', Object.assign({type:"alert-success", message:"Password Successfully Changed"}, userData));
        });
    });
}
module.exports.reg = reg;
module.exports.login = login;
module.exports.updateCity = updateCity;
module.exports.updatePassword = updatePassword;