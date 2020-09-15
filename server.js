
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

const { Client, Ed25519PrivateKey, AccountCreateTransaction, AccountBalanceQuery } = require("@hashgraph/sdk");
require("dotenv").config();


var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// SET OUR VIEWS AND VIEW ENGINE
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

app.get('/', function(request, response) {
    response.render('login', {
        title: 'login'
    });
});

app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {


        request.session.loggedin = true;
        request.session.username = username;
        request.session.password = password;

        main(username, password,response);
        //response.end();

    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

//server.js
app.post('/change',function(req,res){

    // the message being sent back will be saved in a localSession variable
    // send back a couple list items to be added to the DOM
    var username = req.body.accountId

    if (username) {



        console.log(username, req.session.username, req.session.password)
        //response.end();

    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }




});

app.get('/home', function(request, response) {


    if (request.session.loggedin) {
        //console.log("its here")
        //response.send('Welcome back, ' + request.session.username + '!');
        //response.send('Please login to view this page!');
        response.render('home', {
            title: 'home'
        });
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});


app.get('/data', function(req, res){
    res.send('Logged in as ' + req.session.username); //replace with your data here
});

async function main( username,  password, response) {

    console.log(username, password)


    const operatorPrivateKey = password;
    const operatorAccount = username;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();

    client.setOperator(operatorAccount, operatorPrivateKey);

    const balance = await new AccountBalanceQuery()
        .setAccountId(operatorAccount)
        .execute(client);


    //response.send('Your account balance is ' + balance.asTinybar());
    //response.send({success: true, message: '<li>Balance is ' + balance.asTinybar() + '</li>' });
    response.redirect('/home');
    response.end();

    console.log(`${operatorAccount} balance = ${balance.asTinybar()}`);

}

//app.listen(3011);

const port = process.env.PORT || 3012;
app.listen(port, () => {
    console.log("Wazzappp");
});