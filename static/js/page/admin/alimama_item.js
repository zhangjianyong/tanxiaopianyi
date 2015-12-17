$("a [class='act_item']").click(function(i) {
	var t = $(this);
	var item = t.attr('data-item');
	var act = t.attr('data-act');
	$.get("/admin/i/alimama_product_add", {
		item_id: item,
		act_id: act
	}).success(function(data) {
		alert('成功');
		console.log(data);
	}).error(function(xhr, status, error) {
		console.error(error);
		alert('系统错误');
	}).complete(function() {
		$('.ace-thumbnails [data-rel="colorbox"]').each(function(i) {
			var item_id = this.id;
			var option = $.extend({
				href: '/admin/alimama_item?item_id=' + item_id
			}, colorbox_params);
			$(this).colorbox(option);
		});
		$("#cboxLoadingGraphic").append("<i class='icon-spinner orange'></i>"); //let's add a custom loading icon
	});
})