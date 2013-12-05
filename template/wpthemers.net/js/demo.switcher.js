jQuery(document).ready(function($) {
    $('#demo-switcher .style select').on('change', function(){
		document.location = ' index-' +  $(this).val()+ '.html'
	});
    $('#demo-switcher .skin select').on('change', function(){
		$('body').removeClass('orange-skin');
		$('body').removeClass('blue-skin');
		$('body').removeClass('pink-skin');
		$('body').removeClass('green-skin');
		var skin  = $(this).val() + '-skin';
		$('body').addClass(skin);
	});
	$('#demo-switcher .handle').on('click', function(){
		$('#demo-switcher').toggleClass('open');
		$('#demo-switcher .handle').toggleClass('icon-right-open-mini');
	});
});