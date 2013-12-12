jQuery1(function(){
	
	//首页MTG
	jQuery1('div.index-mtg').each(function(){
		var $this = jQuery1(this),$a = $this.find('a'),title = $a.attr('title');
		if(!title)
			return ;
		var html = '<div class="overlay">\
						<div class="overlay-bg"></div>\
						<div class="content"></div>\
					</div>';
		var $overlay = jQuery1(html);
		$overlay.find('.content').text(title);
		$overlay.appendTo($a);
		$this.hover(function(){
			$overlay.stop(true, true).slideToggle(200);
		});
	});
	
	//行业明星
	jQuery1('div.index-star').each(function(){
		var $this = jQuery1(this); 
		var $label = jQuery1('<p />',{'class':'moko-start-label'}).appendTo($this);
		
		$this.hover(function(){
			$label.stop(true, true).slideToggle(200);
		});
	});

	//展示行业标签
	$('div.post-vocation .vocation-mark a').not('.active,.hover').each(function(){
		var $this = $(this);
		$this.hover(function(){
			$this.stop(true,true).animate({'top':'-51','height':100},200);
		},function(){
			$this.stop(true,true).animate({'top':'0','height':49},200);
		});
	});
});