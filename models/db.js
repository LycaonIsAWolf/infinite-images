var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

module.exports = {
	initialize: function(){
		db.serialize(function(){
			db.run("CREATE TABLE posts (id CHAR(10) PRIMARY KEY NOT NULL, time INT NOT NULL, image TEXT NOT NULL, body TEXT NOT NULL, reply_to TEXT, replies INT, latest INT, nsfw TEXT)");
		});
	},

	get_post: function(id, callback){
		db.serialize(function(){
			db.get("SELECT * FROM posts WHERE id = ?", id, function(err, row){
				callback(row, err);
			});
		});
	},

	get_posts: function(callback){
		db.serialize(function(){
			db.all("SELECT * FROM posts WHERE reply_to = ''", function(err, rows){
				posts = rows.sort(function(a, b){
					return a.latest - b.latest;
				});
				callback(posts, err);
			});
		})
	},

	get_replies: function(id, callback){
		db.all("SELECT * FROM posts WHERE reply_to = ?", id, function(err, rows){
			callback(rows, err);
		});
	},

	add_post: function(post, callback){
		db.serialize(function(){
			var statement = db.prepare("INSERT INTO posts VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
			statement.run(post.id, post.time, post.image, post.body, post.reply_to, post.replies, post.time, post.nsfw, function(err){
				if(post.reply_to != ''){
					db.get("SELECT * FROM posts WHERE id = ?", post.reply_to, function(err, row){
						console.log("replying to " + post.reply_to + " " + row);
						db.run("UPDATE posts SET replies = ? WHERE id = ?", row.replies + 1, post.reply_to, function(err){
							db.run("UPDATE posts SET latest = ? WHERE id = ?", post.time, post.reply_to, function(err){
								callback(err);
							});
						});
					});
				}
				else{
					callback(err);
				}
			});
		});
	},

	remove_post: function(id, callback){
		db.serialize(function(){
			var statement = db.prepare("DELETE FROM posts WHERE id = ?");
			statement.run(id, function(err){
				callback(err);
			});
		});
	}

}