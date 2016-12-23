var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

module.exports = {
	initialize: function(){
		db.serialize(function(){
			db.run("CREATE TABLE posts (id CHAR(10) PRIMARY KEY NOT NULL, time INT NOT NULL, image TEXT, body TEXT NOT NULL, reply_to TEXT, replies TEXT)");
		});
	},

	add_post: function(post, callback){
		db.serialize(function(){
			var statement = db.prepare("INSERT INTO posts VALUES (?, ?, ?, ?, ?, ?)");
			var replies = [];
			statement.run(post.id, post.time, post.image, post.body, post.reply_to, JSON.stringify(replies), function(err){
				callback(err);
			});
		});
	},

	get_post: function(id, callback){
		db.serialize(function(){
			db.get("SELECT * FROM posts WHERE ID = ?", id, function(err, row){
				callback(row, err);
			});
		});
	},

	get_posts: function(callback){
		db.serialize(function(){
			db.all("SELECT * FROM posts", function(err, rows){
				var posts = [];
				for(var i = 0; i < rows.length; i++){
					if(rows[i].reply_to == ""){
						posts.push(rows[i]);
					}
				}
				callback(posts, err);
			});
		})
	},

	get_replies: function(id, callback){
		db.all("SELECT * FROM posts", function(err, rows){
			var replies = [];
			for(var i = 0; i < rows.length; i++){
				if(rows[i].reply_to == id){
					replies.push(rows[i]);
				}
			}
			callback(replies, err);
		});
	}

}