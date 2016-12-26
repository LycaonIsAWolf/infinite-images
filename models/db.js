var pg = require('pg');
var pool = new pg.Pool({
	user: process.env.PGUSER,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	host: process.env.PGHOST,
	port: process.env.PGPORT,
	max: 10,
	idleTimeoutMillis: 30000
});
var fs = require('fs');

module.exports = {
	initialize: function(){
		pool.connect(function(err, client, done){
			client.query({text:"CREATE TABLE posts (id CHAR(10) PRIMARY KEY NOT NULL, time TIMESTAMP NOT NULL, image TEXT NOT NULL, body TEXT NOT NULL, reply_to TEXT, replies INT, latest TIMESTAMP, nsfw TEXT)"}, function(err, result){
				if(err){
					console.error("Error initializing db: " + err);
				}
				done();
			});
		});
	},

	get_post: function(id, callback){
		pool.connect(function(err, client, done){
			client.query({text:"SELECT * FROM posts WHERE id = $1", values:[id]}, function(err, result){
				console.log("time: " + result.rows[0].time);
				callback(result.rows[0], err);
				done();
			});
		});
	},

	get_posts: function(callback){
		pool.connect(function(err, client, done){
			client.query({text:"SELECT * FROM posts WHERE reply_to = $1", values:['']}, function(err, result){
				if(result != undefined){
					posts = result.rows.sort(function(a, b){
						return a.latest - b.latest;
					});				
					callback(posts, err);
					done();
				}
				else{
					callback([], err);
					done();
				}
			});
		});
	},

	get_replies: function(id, callback){
		pool.connect(function(err, client, done){
			client.query({text:"SELECT * FROM posts WHERE reply_to = $1", values:[id]}, function(err, result){
				callback(result.rows, err);
				done();
			});
		});
	},

	get_all_posts: function(callback){
		pool.connect(function(err, client, done){
			client.query({text:"SELECT * FROM posts"}, function(err, result){
				callback(result.rows, err);
				done();
			});
		});
	},

	add_post: function(post, callback){
		pool.connect(function(err, client, done){
			var statement = "INSERT INTO posts (id, time, image, body, reply_to, replies, latest, nsfw) VALUES ($1, current_timestamp, $2, $3, $4, $5, current_timestamp, $6)";
			client.query({text: statement, values: [post.id, post.image, post.body, post.reply_to, post.replies, post.nsfw]}, function(err, result){
				if(post.reply_to != ''){
					client.query({text:"SELECT * FROM posts WHERE id = $1", values:[post.reply_to]}, function(err, results){
						client.query({text:"UPDATE posts SET replies = $1 WHERE id = $2", values:[results.rows[0].replies + 1, post.reply_to]}, function(err){
							client.query({text:"UPDATE posts SET latest = current_timestamp WHERE id = $1", values:[post.reply_to]}, function(err){
								callback(err);
								done();
							});
						});
					});
				}
				else{
					callback(err);
					done();
				}
			});
		});
	},

	remove_post: function(id, callback){
		pool.connect(function(err, client, done){
			client.query({text:"SELECT * FROM posts WHERE id = $1", values:[id]}, function(err, result){
				var post = result.rows[0];
				if(post.image != '/images/placeholder-image.png'){
					fs.unlink('./static' + post.image, function(err){
						if(err){
							console.error(err);
						}
						client.query({text: "DELETE FROM posts WHERE id = $1", values:[post.id]}, function(err, result){
							callback(err);
							done();
						});
					});
				}
				else{
					client.query({text: "DELETE FROM posts WHERE id = $1", values:[post.id]}, function(err){
						callback(err);
						done();
					});
				}
			});
		});
	}

}