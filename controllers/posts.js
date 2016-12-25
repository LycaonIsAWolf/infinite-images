var express = require('express');
var db = require('../models/db.js');
var post = require('../models/post.js');
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
		}),

		limits: {
			fileSize: 10000000
		}
	}).single('image');


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