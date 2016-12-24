$("#nsfw-image").click(function(){
	$(this).attr("src", $(this).attr("hiding"));
	$(this).attr("id", "revealed-nsfw");
	$(this).unbind();
	$(this).wrap('<a href="' + $(this).attr("src") + '" data-toggle="lightbox"></a>');
});