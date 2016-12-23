var express = require('express');
var db = require('../controllers/db.js');
var Post = require('../controllers/post.js');
var config = require('../config.js');
var request = require('request');
var path = require('path');

var marked = require('marked');
marked.setOptions({
	gfm: true,
	sanitize: true,
	smartLists: true,
	tables: true,
	breaks: true
});

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

router.post('/', upload.single('image'), function(req, res){

	if(req.body.body != "" || req.file != undefined){
		var post = new Post(marked(req.body.body), req.file != undefined ? "/uploads/" + path.basename(req.file.path) : "/images/placeholder-image.png");
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
		db.get_posts(function(rows, err){
			if(!err){
				res.render('index', {posts: rows.reverse(), error: "Post body and file cannot be empty."});
			}
			else{
				console.error(err);
			}
		})		
	}

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
	db.get_replies(req.post.id, function(replies, err){
		res.render('post', {post: req.post, replies: replies.reverse()});
	});
});

router.post('/posts/:id', upload.single('image'), function(req, res){
	if(req.body.body != "" || req.file != undefined){
		var reply = new Post(marked(req.body.body), req.file != undefined ? path.basename(req.file.path) : "", req.post.id);
		db.add_post(reply, function(err){
			if(err){
				console.error(err);
			}
			else{
				db.get_replies(req.post.id, function(replies, err){
					res.render('post', {post: req.post, replies: replies});
				});
			}
		});
	}
	else{
		db.get_replies(req.post.id, function(replies, err){
			res.render('post', {post: req.post, replies: replies, error: "Post body and file cannot be empty."});
		});
	}
});

module.exports = router;