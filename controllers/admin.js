var express = require('express');
var basic_auth = require('basic-auth');
var db = require('../models/db.js');
var config = require('../config.js');

var router = express.Router();

var auth = function(req, res, next){
	function unauthorized(res){
		res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
		return res.send(401);
	}

	var user = basic_auth(req);
	if(!user || !user.name || !user.pass){
		return unauthorized(res);
	}

	if(user.name === config.admin_user && user.pass === config.admin_pass){
		return next();
	}
	else{
		return unauthorized(res);
	}
}

router.get("/", auth, function(req, res){
	db.get_posts(function(rows, err){
		if(!err){
			res.render('admin', {posts: rows.reverse()});
		}
		else{
			console.error(err);
		}
	});
});

router.post("/", auth, function(req, res){
	db.remove_post(req.body.id, function(err){
		if(!err){
			db.get_posts(function(rows, err){
				if(!err){
					res.render('admin', {posts: rows.reverse()});
				}
				else{
					console.error(err);
				}
			});
		}
		else{
			console.error();
		}
	});
});

module.exports = router;