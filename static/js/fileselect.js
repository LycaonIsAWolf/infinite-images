$("#image").change(function(){
	var filename = $(this).val();
	if(filename.indexOf("\\") > -1){
		$("#file-select-label").html(filename.split("\\").pop());
	}
	else{
		$("#file-select-label").html(filename.split("/").pop());
	}
});