 const express = require('express');
 const bodyParser = require('body-parser');
const mysql = require('mysql');
const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'Doordie@123',
	database : 'FeedbackPortalDatabase'
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connection.connect(function(err){
	if(!err) {
     console.log("Database is connected ... \n\n");  
 } else {
     console.log("Error connecting database ... \n\n");  
 }
 });

app.get('/addData',(req,res) => {
	let post = {id: 1, name : 'shivam'};
	let sql = 'INSERT INTO person set ?';
	let query = connection.query(sql,post,(err,result) => {
		if(err) throw err;
		console.log(result);
		res.send('Post added');
	});

});

app.get('/getPosts',(req,res) => {
	let sql = 'select * from person';
	let query = connection.query(sql,(err,result) => {
		if(err) throw err;
		console.log(result);
		res.send('Post fetched');
	});

});

app.get('/selectpost/:id', (req,res) => {
	let sql = `select * from person where id = ${req.params.id}`;
	let query = connection.query(sql,(err,result) => {
		if(err) throw err;
		console.log(result);
		res.send('Post fetched'); 
	});
});

app.get('/updatepost/:id', (req,res) => {
	let newName = 'newName';
	let sql = `update person set name = '${newName}' WHERE id = ${req.params.id}`;
	let query = connection.query(sql,(err,result) => {
		if(err) throw err;
		console.log(result);
		res.send('Post updated'); 
	});
});

app.post('/html/signup.html', (req,res) => {
	console.log("hehe");
	res.send('Got your data');
});

app.listen(3000, function(err, res){
	console.log("server started");
});
