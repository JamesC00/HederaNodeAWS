
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

const { Client, Ed25519PrivateKey, AccountCreateTransaction, AccountBalanceQuery, CryptoTransferTransaction } = require("@hashgraph/sdk");
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
    response.render('test', {
        title: 'test'
    });
});

app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {


        request.session.loggedin = true;
        request.session.username = username;
        request.session.password = password;

        main(username, password,response, request);
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
    var amount = req.body.amount

    if (username) {



        console.log(username, req.session.username, req.session.password)

        transferMoney(username,amount, req.session.username, req.session.password, res)

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
    res.send('<h1>Logged in as ' + req.session.username + '</h1>'); //replace with your data here
    //response.send({success: true, message: '<li>Logged in as ' + req.session.username + '</li>' });
});

app.get('/myBalance', function(req, res){
    //res.send('<li>Your account balance is ' + req.session.balance + '</li>'); //replace with your data here
    main2(req.session.username, req.session.password, res)
   // res.send('<h1>Your Account Balance ' + req.session.username + '</h1>'); //replace with your data here
    //response.send({success: true, message: '<li>Logged in as ' + req.session.username + '</li>' });
});

async function transferMoney(newAccountId, amount, myAccountId, myAccountPrivateKey, response){
    //Create the transfer transaction
    const operatorPrivateKey = myAccountPrivateKey;
    const operatorAccount = myAccountId;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();

    client.setOperator(operatorAccount, operatorPrivateKey);

    const transferTransactionId = await new CryptoTransferTransaction()
        .addSender(myAccountId, amount)
        .addRecipient(newAccountId, amount)
        .execute(client);

    //Verify the transaction reached consensus
    const transactionReceipt = await transferTransactionId.getReceipt(client);

    console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status);

    //Request the cost of the query
    const getBalanceCost = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .getCost(client);

    console.log(`The cost of query is: ${getBalanceCost}`);

    //Check the new account balance
    const getNewBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    response.send({success: true, message: '<li>The account balance after the transfer is ' + getNewBalance +  '</li>' });
    console.log("Successfuly sent. Recepient balance after the transfer is: " +getNewBalance +" hbar.")
}

async function main( username,  password, response, request) {

    //console.log(username, password)


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


    //.send('<li>Your Account Balance ' + balance + '</li>');
    ///response.send('Your account balance is ' + balance.asTinybar());
    //response.send({success: true, message: '<li>Balance is ' + balance.asTinybar() + '</li>' });
    request.session.balance = balance.asTinybar();
    response.redirect('/home');
    //response.end();

    console.log(`${operatorAccount} balance = ${balance.asTinybar()}`);

}


async function main2( username,  password, response) {

    //console.log(username, password)


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


    //.send('<li>Your Account Balance ' + balance + '</li>');
    ///response.send('Your account balance is ' + balance.asTinybar());
    //response.send({success: true, message: '<li>Balance is ' + balance.asTinybar() + '</li>' });
    //request.session.balance = balance.asTinybar();
    response.send('<li>Your account balance is ' + balance + '</li>');
    //response.redirect('/home');
    //response.end();

    console.log(`${operatorAccount} balance = ${balance.asTinybar()}`);

}


//app.listen(3011);

const port = process.env.PORT || 3013;
app.listen(port, () => {
    console.log("Wazzappp");
});