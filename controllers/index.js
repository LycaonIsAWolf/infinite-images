var express = require('express');
var db = require('../models/db.js');
var upload = require("../models/uploader.js");
var post = require('../models/post.js');
var path = require('path');


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

router.post('/', function(req, res){
	upload(req, res, function(err){
		if(!err){
			post.make_post(req, function(success, post, err){
				if(success){
					res.redirect('/posts/' + post.id);
				}
				else{
					db.get_posts(function(rows, er){
						if(!er){
							res.render('index', {posts: rows.reverse(), error: err});
						}
						else{
							console.error(err.stack);
							res.redirect(500, '/');
						}
					})		
				}
			});
		}
		else{
			
			db.get_posts(function(rows, er){
				if(!er){
					res.render('index', {posts: rows.reverse(), error: "File bigger than file size limit of 10MB."});
				}
				else{
					console.error("error displaying error: " + er);
					res.redirect(500, '/');
				}
			})		
		}
	})
});


module.exports = router;