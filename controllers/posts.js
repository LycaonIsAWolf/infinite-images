var express = require('express');
var db = require('../models/db.js');
var upload = require("../models/uploader.js");
var post = require('../models/post.js');
var path = require('path');

var router = express.Router();

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

router.get('/:id', function(req, res){
	db.get_replies(req.post.id, function(replies, err){
		res.render('post', {post: req.post, replies: replies});
	});
});

router.post('/:id', function(req, res){
	upload(req, res, function(err){
		if(!err){
			post.make_post(req, function(success, post, err){
				if(success){
					db.get_replies(req.post.id, function(replies, err){
						res.render('post', {post: req.post, replies: replies});
					});
				}
				else{
					db.get_posts(function(rows, er){
						if(!er){
							db.get_replies(req.post.id, function(replies, err){
								res.render('post', {post: req.post, replies: replies, error: err});
							});
						}
						else{
							console.error(err);
							res.redirect(500, '/');
						}
					})	;	
				}
			});
		}
		else{
			db.get_posts(function(rows, er){
				if(!er){
					db.get_replies(req.post.id, function(replies, err){
						res.render('post', {post: req.post, replies: replies, error: "File bigger than max file size limit of 10MB."});
					});
				}
				else{
					console.error(err);
					res.redirect(500, '/');
				}
			});
		}

	});

});

module.exports = router;