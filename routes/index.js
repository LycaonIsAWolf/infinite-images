var express = require('express');
var db = require('../controllers/db.js');
var Post = require('../controllers/post.js');

var router = express.Router();

router.get('/', function(req, res){
	db.get_posts(function(rows, err){
		if(!err){
			res.render('index', {posts: rows});
		}
		else{
			console.error(err);
		}
	})
});

router.post('/post', function(req, res){
	console.log("post request: " + req.body.body);
	var post = new Post(req.body.body, "test image");
	console.log(post.time);

	db.add_post(post, function(err){
		if(err){
			console.error(err);
		}
		else{
			res.redirect('/post/' + post.id);
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

router.get('/post/:id', function(req, res){
	res.render('post', {post: req.post});
});

module.exports = router;