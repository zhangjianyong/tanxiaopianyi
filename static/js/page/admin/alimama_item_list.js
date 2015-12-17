jQuery(function($) {
	var colorbox_params = {
		reposition: true,
		scalePhotos: true,
		scrolling: false,
		previous: '<i class="icon-arrow-left"></i>',
		next: '<i class="icon-arrow-right"></i>',
		close: '&times;',
		current: '{current} of {total}',
		maxWidth: '100%',
		maxHeight: '100%',
		onOpen: function() {
			//console.log($(this).attr('data-item_id'));
			document.body.style.overflow = 'hidden';
		},
		onClosed: function() {
			document.body.style.overflow = 'auto';
		},
		onComplete: function() {
			$.colorbox.resize();
		}
	};

	function load() {
		$.get("/admin/i/alimama_item_list", {
			rows: 100
		}).success(function(data) {

			var a = eval(data);
			var tpl = $("#tpl").html();
			var html = template(tpl, {
				list: a
			});
			$("#show").html(html);
		}).error(function(xhr, status, error) {
			console.error(error);
		}).complete(function() {
			$('.ace-thumbnails [data-rel="colorbox"]').each(function(i) {
				var item_id = this.id;
				var option = $.extend({href: '/admin/alimama_item?item_id='+item_id},colorbox_params);
				$(this).colorbox(option);
			});
			$("#cboxLoadingGraphic").append("<i class='icon-spinner orange'></i>"); //let's add a custom loading icon
		});
	};
	load();

	/**$(window).on('resize.colorbox', function() {
		try {
			//this function has been changed in recent versions of colorbox, so it won't work
			$.fn.colorbox.load();//to redraw the current frame
		} catch(e){}
	});*/
})