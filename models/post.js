var path = require('path');
var db = require('./db.js');

var marked = require('marked');
marked.setOptions({
	gfm: true,
	sanitize: true,
	smartLists: true,
	tables: true,
	breaks: true
});


var Post = function(body, image, nsfw, reply_to){
	this.id = get_id(10);
	this.time = Date.now();
	this.body = body;
	this.image = image;
	this.reply_to = reply_to;
	this.replies = 0;
	this.nsfw = nsfw;
}

var idChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ12345678';
function get_id(length){
	var id = '';
	for(var i = 0; i < length; i++){
		id += idChars[Math.floor(Math.random() * idChars.length)];
	}
	return id;
}

function make_post(req, callback){
	console.log(req.body.body.length);
	if(req.body.body != "" && req.body.body.length <= 420){
		var post = new Post(marked(req.body.body), 
							req.file != undefined ? "/uploads/" + path.basename(req.file.path) : "/images/placeholder-image.png",
							req.body.nsfw,
							req.post != undefined ? req.post.id : '');

		db.add_post(post, function(err){
			if(!err){
				callback(true, post);
			}
			else{
				console.error(err);
			}
		});
	}
	else if(req.body.body.length > 420){
		callback(false, null, "Post body too long.");
	}
	else if(req.body.body == ""){
		callback(false, null, "Post body cannot be empty.");
	}
}

module.exports.Post = Post;
module.exports.make_post = make_post;