$("#loginButton").on('click', function() {
	var u_name = $("#u_name").val();
	var u_pwd = $("#u_pwd").val();
	$.post("/admin/sign_in", {
		'u_name': u_name,
		'u_pwd': u_pwd
	}).success(function(data) {
		var a = eval(data);
		if (a.status == 'ok') {
			console.info(a.msg);
		} else if (a.status == 'ko') {
			console.info(a.msg);
		} else{
			console.log(a);
		}
	}).error(function(xhr, status, error) {
		console.error(error);
	}).complete(function() {

	});
});