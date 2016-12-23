var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

module.exports = {
	initialize: function(){
		db.serialize(function(){
			db.run("CREATE TABLE posts (id CHAR(10) PRIMARY KEY NOT NULL, time INT NOT NULL, image TEXT, body TEXT NOT NULL)");
		});
	},

	add_post: function(post, callback){
		db.serialize(function(){
			var statement = db.prepare("INSERT INTO posts VALUES (?, ?, ?, ?)");
			statement.run(post.id, post.time, post.image, post.body, function(err){
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
				callback(rows, err);
			});
		})
	}
}