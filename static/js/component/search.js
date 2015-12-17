define(function(require, exports) {
	require('jquery');

	exports.go = function(searchForm, searchBtn, searchText) {
		var sform = $(searchForm);
		var sbtn = $(searchBtn);
		var stext = $(searchText);
		sform.attr("action", '/search');
		sbtn.click(function() {
			if (stext.val()) {
				sform.submit();
			} else {
				stext.attr('placeholder', '亲,输入个关键字呗');
				return false;
			}
		});
	};
});