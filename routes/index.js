var express = require('express');
var db = require('../controllers/db.js');
var Post = require('../controllers/post.js');
var config = require('../config.js');
var request = require('request');
var path = require('path');

var multer = require('multer');
var upload = multer({
		fileFilter: function(req, file, cb){
			if((file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype=="image/*")){
				console.log("file ok");
				cb(null, true);
			}
			else{
				console.log("file rejected");
				cb(null, false);
			}
		},

		storage: multer.diskStorage({
			destination: function(req, file, cb){
				cb(null, './static/uploads/');
			},
			filename: function(req, file, cb){
				cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
			}
		})
	});

var router = express.Router();

router.get('/', function(req, res){
	db.get_posts(function(rows, err){
		if(!err){
			res.render('index', {posts: rows.reverse()});
		}
		else{
			console.error(err);
		}
	})
});

router.post('/post', upload.single('image'), function(req, res){
	console.log("recaptcha: " + req.body["g-recaptcha-response"]);	

	request.post("https://www.google.com/recaptcha/api/siteverify", {secret: config.recaptcha_secret, response: req.body["g-recaptcha-response"]}, function(error, response, body){
		console.log('success: ' + JSON.parse(body)["success"]);
		if(body["success"]){
			var post = new Post(req.body.body, req.file != undefined ? path.basename(req.file.path) : "");
			db.add_post(post, function(err){
				if(err){
					console.error(err);
				}
				else{
					res.redirect('/posts/' + post.id);
				}
			});
		}
		else{
			res.redirect(403, '/');
		}
	});

});

router.param('id', function(req, res, next, id){
	db.get_post(id, function(post, err){
		if(err){
			next(err);
		}
		else if(post != null){
			req.post = post;
			next();
		}
		else{
			next(new Error("failed to load post"));
		}
	});
});

router.get('/posts/:id', function(req, res){
	res.render('post', {post: req.post});
});

module.exports = router;