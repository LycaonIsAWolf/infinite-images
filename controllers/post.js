var Post = function(body, image, reply_to){
	this.id = get_id(10);
	this.time = Date.now();
	this.body = body;
	this.image = image;
	this.reply_to = reply_to != undefined ? reply_to : "";
}

var idChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ12345678';
function get_id(length){
	var id = '';
	for(var i = 0; i < length; i++){
		id += idChars[Math.floor(Math.random() * idChars.length)];
	}
	return id;
}

module.exports = Post;