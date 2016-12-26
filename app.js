var express = require('express');
var app = express();

var fs = require('fs')
var multer = require('multer');
var bodyParser = require('body-parser');

var db = require('./models/db.js');
var index = require('./controllers/index.js');
var posts = require('./controllers/posts.js');
var admin = require('./controllers/admin.js');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', index);
app.use('/posts', posts);
app.use('/admin', admin);
app.use(function(err, req, res, next){
	console.error(err.stack)
	res.status(500).render('500');
});
app.use(function(req, res, next){
	res.status(404).render('404');
});

db.initialize();

fs.mkdir('./static/uploads', function(err){
	if(err){
		if(!err.code =='EEXIST'){
			console.error("Error creating uploads folder: " + err);
		}
	}
});

var server = app.listen(process.env.PORT || 5000, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log("Server listening at http://%s:%s", host, port);
});