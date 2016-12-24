var express = require('express');
var db = require('../models/db.js');
var post = require('../models/post.js');
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

router.post('/', upload.single('image'), function(req, res){
	post.make_post(req, function(success, post){
		if(success){
			res.redirect('/posts/' + post.id);
		}
		else{
			db.get_posts(function(rows, err){
				if(!err){
					res.render('index', {posts: rows.reverse(), error: "Post body cannot be empty."});
				}
				else{
					console.error(err);
					res.redirect(500, '/');
				}
			})		
		}
	});

});


module.exports = router;