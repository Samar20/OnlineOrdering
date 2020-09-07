const session = require('express-session');
//require module, pass it the session module
const MongoDBStore = require('connect-mongodb-session')(session);

const express = require('express');
const mongoose = require('mongoose');

const fs = require("fs");
const Schema = mongoose.Schema;





//Create the new mongo store, using the database we have been
// using already, and the collection sessiondata
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/a4',
    collection: 'sessiondata'
});

mongoose.connect('mongodb://localhost:27017/a4', { useNewUrlParser: true });

let app = express();
let db = mongoose.connection;

//Schema for my users
let userSchema = Schema({
    username: String,
    password: String,
    privacy: Boolean,
    orders: [{ type: Object }]
});
//Schema for my order
let orderSchema = ({
    username: String,
    restaurant: String,
    order: [{ type: Object }],
    subtotal: Number,
    tax: Number,
    fee: Number,
    total: Number

});

let orderModel = mongoose.model('Orders', orderSchema);

let userModel = mongoose.model('Users', userSchema);




app.use(session({ secret: 'some secret here' }));










app.set("view engine", "pug");
app.set("views", "./public/pugViews");

app.use(express.static("./public"));
app.use(express.json());



let status;
let onlineUser;









//once the home page is called
app.get("/", function (req, res, next) {
    if (req.session.loggedin == undefined || req.session.loggedin == false) {
        //check if there is no session or the person is not logged in
        //then render homepage
        res.render('home', { auth: req.session.loggedin });
    } else {
        //else if somebody is logged in 
        userModel.findOne({ username: { $regex: req.session.user } }, function (err, ans) {
            //find who is logged in so we can pass their object for the header of the pug
            
                if (err) {
                    console.log("error 1: " + err);
                }

                res.render('home', { users: ans, auth: req.session.loggedin, log: ans })
            
        });
    }
});

app.get("/register", function (req, res, next) {
    //if somebody is trying to register render register
    if (req.session.loggedin == undefined || req.session.loggedin == false) {
        //check if somebody is not loggedin
        res.render('register', { auth: req.session.loggedin });
    } else {
        userModel.findOne({ username: { $regex: req.session.user } }, function (err, ans1) {
            //if somebody is find them and send the information
            if (err) {
                console.log("error: " + err);
                return err;
            }

            //and render the pug file
            res.render('register', { users: users, auth: req.session.loggedin, log: ans1 });

        });

    }
});

app.post("/register", function (req, res, next) {
    //get the JSON from the xhttp
    let user = req.body;

    userModel.findOne({ username: { $regex: user.username } }, function (err, result) {
        //check if somebody has the same username
        if (err) {
            console.log(err);
        }


        if (result == null) {
            //if there is no username with the same name
            //create a new user
            //make the session.loggedin true
            //and redirect
            let newUser = new userModel();
            newUser.username = user.username;
            newUser.password = user.password;
            newUser.privacy = user.privacy;
            newUser.orders = [];
            req.session.loggedin = true;
            status = true;
            onlineUser = user.username;
            req.session.user = user.username;

            newUser.save(function (error, user) {
                //save the newuser and get back the id
                if (error) {
                    console.log(error);
                }
                //send the user id
                res.send(user.id);
            })
        }
        else {
            //there is somebody with the same username
            res.send("okay");
        }
    })



});

app.get("/users", function (req, res, next) {
    //if there is a query get it 
    let name = req.query.name;

    if (name === undefined) {
        //there is no query at the moment
        userModel.find({}, function (err, result) {
            //get all users
            let users = [];
            result.forEach(function (person) {
                if (person.privacy == false) {
                    //if their privacy is not private 
                    //push it to the list
                    users.push(person);
                }
            });
            if (req.session.loggedin == undefined || req.session.loggedin == false) {
                //if there is nobody logged in render list
                res.render('list', { users: users, auth: req.session.loggedin });
            } else {
                //there is somebody logged in get their information
                userModel.findOne({ username: { $regex: req.session.user } }, function (err, ans1) {
                    if (err) {
                        console.log("error: " + err);
                        return err;
                    }
                    
                        //and render the pug file
                        res.render('list', { users: users, auth: req.session.loggedin, log: ans1 });
                    
                });
            }
        });
    } else {
        userModel.find({ username: { $regex: new RegExp(name, "i") } }, function (err, ans) {
            //there is a query
            //get all users with the same word
            if (err) {
                console.log(err);
            }
            let users = [];
            ans.forEach(function (user) {
                if (user.privacy == false) {
                    //push it in the array if privacy is not private
                    users.push(user);
                }


            });
            if (req.session.loggedin == undefined || req.session.loggedin == false) {
                //if somebody is not logged in the just render the pug
                res.render('list', { users: users, auth: req.session.loggedin })
            } else {
                //but if there is send their information with the pug
                userModel.findOne({ username: { $regex: req.session.user } }, function (err, ans1) {
                    if (err) {
                        console.log("error: " + err);
                        return err;
                    }
                   
                        res.render('list', { users: users, auth: req.session.loggedin, log: ans1 })
                    
                });

            }


        })
    }


});

app.post("/check", function (req, res, next) {
    //this function is to check if the information is correct when somebody logs in 
    let user = req.body;


    userModel.findOne({ username: { $regex: user.username } }, function (err, result) {
        //find out who is logged in

        if (err) {
            console.log(err);
        }

        if (result == null) {
            //if there is nobody with the same information that means there is no username with that name
            res.setHeader('Content-Type', 'text/html');
            res.send("none")
        }
        else {
            //so now we found it 

            if (result.password == user.password) {
                //we check if the password is correct
                //and set the session.loggedin to true
                req.session.loggedin = true;
                status = true;
                onlineUser = user.username;
                req.session.user = user.username;

                res.send(result._id);
            } else {

                //the password is wrong so request for the right one
                res.setHeader('Content-Type', 'text/html');
                res.send("wrong");
            }



            
        }
    })

})

app.get("/users/:userID", function (req, res, next) {
    //this function finds specific users and and renders their profile

    //get the id from thhe url
    let id = req.params.userID;

    userModel.findById(id, function (err, ans) {
        //find the id
        if (err) {
            console.log(err);
        }

        if (ans.username == req.session.user) {
            //if the id is the same as the person logged on 
            res.render('private', { users: ans });
        } else {
            //check if the user is a private user
            if (ans.privacy == true) {
                //if they are tell the user they can't access this page
                res.status(403).send('You do not have access to this page');
            } else {
                //if they aren't
                if (req.session.loggedin == undefined || req.session.loggedin == false) {
                    //check if somebody is logged in
                    //if not render their public profile
                    res.render('public', { users: ans, auth: req.session.loggedin });
                } else {
                    //if somebody is logged in get their information and send it to the pug
                    userModel.findOne({ username: { $regex: req.session.user } }, function (err1, ans1) {
                        if (err1) {
                            console.log(err1);
                        }
                        
                            res.render('public', { users: ans, auth: req.session.loggedin, log: ans1 });

                        

                    });
                }
            }
        }

    });



});

app.get("/order", function (req, res, next) {
    //this function produces an html page for users logged in to order 
    if (req.session.loggedin == undefined || req.session.loggedin == false) {
        //if nobody is logged in they do not have access to the page
        res.status(403).send("You do not have access while logged out");
    }
    else {
        //if they are logged in find the user and send the information with the pug
        userModel.findOne({ username: { $regex: req.session.user } }, function (err1, ans1) {
            
                res.render('order', { log: ans1 })
            
        });
    }


});

app.post("/logout", function (req, res, next) {
    //this function allows the user to logout
    //it makes the session user null
    req.session.user = null;
    req.session.destroy(function (err) {
        //and destorys the session
        if (err) {
            console.log("error from logout: " + err);
        }
        res.send();
    })

});

app.post("/orders", function (req, res, next) {
    //this function allows user to save their orders in their history
    let order = req.body;



    //creates a new order
    let newOrder = new orderModel();
    newOrder.username = req.session.user;
    newOrder.restaurant = order.restaurantName;
    newOrder.order = order.order;
    newOrder.subtotal = order.subtotal
    newOrder.tax = order.tax;
    newOrder.fee = order.fee;
    newOrder.total = order.total;


    newOrder.save(function (error, order) {
        if (error) {
            console.log(error);
        }
        //save the order and update the order id to the user orders array
        userModel.findOneAndUpdate({ username: { $regex: req.session.user } }, { $push: { "orders": order.id } }, { useFindAndModify: false }, function (err, user) {
            if (err) {
                console.log("error with order saving: " + err);
            }
            res.send();


        })
    });

});


app.get('/orders/:orderID', function (req, res, next) {
    //this function allows users to see what each order is

    //first get the id from the url
    let id = req.params.orderID;
    orderModel.findById(id, function (err, ans) {
        //find that order object
        if (err) {
            console.log(err);
        }


        userModel.findOne({ username: { $regex: ans.username } }, function (err1, ans1) {
            //it then find the user who ordered that order
            
                if (err1) {
                    console.log(err1);
                }
                if (ans1.privacy == false) {
                    //checks if the user is not private
                    if (req.session.loggedin == undefined || req.session.loggedin == false) {
                        //checks if there is nobody logged in
                        res.render('summary', { order: ans, auth: req.session.loggedin });
                    } else {
                        //if somebody is logged in
                        userModel.findOne({ username: { $regex: req.session.user } }, function (err2, ans2) {
                            //get that persons information
                            
                                if (err2) {
                                    console.log(err2);
                                }
                                res.render('summary', { order: ans, auth: req.session.loggedin, log: ans2 });
                            
                        });
                    }

                } else {
                    //if they are a private user
                    if (req.session.loggedin == undefined || req.session.loggedin == false) {
                        //if nobody is logged in they do not have access
                        res.status(403).send('You do not have access to this page');

                    }
                    else {
                        //if somebdy is logged on
                        userModel.findOne({ username: { $regex: req.session.user } }, function (err2, ans2) {
                            //get their information
                            
                                if (ans.username == req.session.user) {
                                    //and check if they are the same person

                                    if (err2) {
                                        console.log(err2);
                                    }

                                    res.render('summary', { order: ans, auth: req.session.loggedin, log: ans2 });

                                } else {
                                    //if not they have no access
                                    res.status(403).send('You do not have access to this page');

                                }
                            
                        });
                    }
                }
            
        });

    });
});

app.post('/save', function (req, res, next) {
    //this function allows users to change their privacy settings

    //find out what privacy they want from the url
    let privacy = req.query.privacy;

    if (privacy == 'on') {
        //if its on then change the privacy to true
        userModel.findOneAndUpdate({ username: { $regex: req.session.user } }, { $set: { privacy: true } }, { useFindAndModify: false }, function (err2, ans2) {
            if (err2) {
                console.log(err2);
            }
        });

    } else {
        //turn off privacy then
        userModel.findOneAndUpdate({ username: { $regex: req.session.user } }, { $set: { privacy: false } }, { useFindAndModify: false }, function (err2, ans2) {
            if (err2) {
                console.log(err2);
            }
        });

    }




});



db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {





    // Start server once Mongo is initialized
    app.listen(3000);
    console.log("Listening on port 3000");
});