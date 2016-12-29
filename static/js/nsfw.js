$(".nsfw-image").click(function(){
	$(this).attr("src", $(this).attr("hiding"));
	$(this).addClass('revealed-nsfw').removeClass('nsfw-image');
	$(this).unbind();
	$(this).wrap('<a href="' + $(this).attr("src") + '" data-toggle="lightbox"></a>');
});