seajs.use(['component/floatdiv'], function(floatdiv) {
	floatdiv.top('#jx_mlnav_bg');
});
seajs.use(['jquery'], function() {
	$('.next_a').click(function() {
		var PARENT = $(this).parent();
		PARENT.hide();
		var next_page = parseInt(PARENT.attr('data-page')) + 1;
		$('[data-page=' + next_page + ']').show();
	});
});
seajs.use(['jquery'], function() {
	$('.li_list').hover(function() {
		$(this).attr('class', 'li_hover');
	}, function(e) {
		$(this).attr('class', 'li_list');
	});
});
seajs.use(['component/search'], function(search) {
	search.go('#searchForm', '.seach_btn', '.seach_text');
});
seajs.use(['component/search'], function(search) {
	search.go('#searchForm2', '.btn', '.searchkw');
});