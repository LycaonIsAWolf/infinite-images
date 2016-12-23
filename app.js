var express = require('express');
var app = express();

var fs = require('fs')
var multer = require('multer');
var bodyParser = require('body-parser');

var db = require('./controllers/db.js');
var index = require('./routes/index.js');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', index);

db.initialize();

fs.readdir('./static/uploads/', function(err, files){
	for(var i = 0; i < files.length; i++){
		console.log(files[i]);
		fs.unlink('./static/uploads/' + files[i], function(err){});
	}
});

var server = app.listen(process.env.PORT || 5000, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log("Server listening at http://%s:%s", host, port);
});