var express = require('express');
var app = express();

bodyParser = require('body-parser');

var db = require('./controllers/db.js');
var index = require('./routes/index.js');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', index);


db.initialize();

var server = app.listen(process.env.PORT || 5000, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log("Server listening at http://%s:%s", host, port);
});