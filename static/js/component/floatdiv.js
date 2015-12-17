define(function(require, exports) {
	require('jquery');
	
	exports.top = function(div) {
		var _div = $(div);
		var _top  = _div.offset().top;
		$(window).scroll(function() {
			var scroH = $(this).scrollTop();
			if (scroH > _top) {
				_div.addClass("fixnav_fixed");

			} else {
				_div.removeClass("fixnav_fixed");
			}
		});
	};
});