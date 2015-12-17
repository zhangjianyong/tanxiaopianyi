seajs.use(['component/search'], function(search) {
	search.go('#searchForm', '.seach_btn', '.seach_text');
});
seajs.use(['jquery'], function() {
	$('.next_a').click(function() {
		var PARENT = $(this).parent();
		PARENT.hide();
		var next_page = parseInt(PARENT.attr('data-page')) + 1;
		$('[data-page=' + next_page + ']').show();
	});
});