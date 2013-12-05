(function ($, window, document, undefined) {
	var pluginName = "comingSoon",
		defaults = {
			locations: [],
			centerAt: [],	//Lat-Lng position to center the map on
			mapStyles: {
				"subtle"	: [{featureType:"road",elementType:"labels",stylers:[{visibility:"simplified"},{lightness:20}]},{featureType:"administrative.land_parcel",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"landscape.man_made",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"road.local",elementType:"labels",stylers:[{visibility:"simplified"}]},{featureType:"road.local",elementType:"geometry",stylers:[{visibility:"simplified"}]},{featureType:"road.highway",elementType:"labels",stylers:[{visibility:"simplified"}]},{featureType:"poi",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.arterial",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"all",stylers:[{hue:"#a1cdfc"},{saturation:30},{lightness:49}]},{featureType:"road.highway",elementType:"geometry",stylers:[{hue:"#f49935"}]},{featureType:"road.arterial",elementType:"geometry",stylers:[{hue:"#fad959"}]}],
				"retro"		: [{featureType:"administrative",stylers:[{visibility:"off"}]},{featureType:"poi",stylers:[{visibility:"simplified"}]},{featureType:"road",elementType:"labels",stylers:[{visibility:"simplified"}]},{featureType:"water",stylers:[{visibility:"simplified"}]},{featureType:"transit",stylers:[{visibility:"simplified"}]},{featureType:"landscape",stylers:[{visibility:"simplified"}]},{featureType:"road.highway",stylers:[{visibility:"off"}]},{featureType:"road.local",stylers:[{visibility:"on"}]},{featureType:"road.highway",elementType:"geometry",stylers:[{visibility:"on"}]},{featureType:"water",stylers:[{color:"#84afa3"},{lightness:52}]},{stylers:[{saturation:-17},{gamma:.36}]},{featureType:"transit.line",elementType:"geometry",stylers:[{color:"#3f518c"}]}],
				"grayscale"	: [{featureType:"landscape",stylers:[{saturation:-100},{lightness:65},{visibility:"on"}]},{featureType:"poi",stylers:[{saturation:-100},{lightness:51},{visibility:"simplified"}]},{featureType:"road.highway",stylers:[{saturation:-100},{visibility:"simplified"}]},{featureType:"road.arterial",stylers:[{saturation:-100},{lightness:30},{visibility:"on"}]},{featureType:"road.local",stylers:[{saturation:-100},{lightness:40},{visibility:"on"}]},{featureType:"transit",stylers:[{saturation:-100},{visibility:"simplified"}]},{featureType:"administrative.province",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"labels",stylers:[{visibility:"on"},{lightness:-25},{saturation:-100}]},{featureType:"water",elementType:"geometry",stylers:[{hue:"#ffff00"},{lightness:-25},{saturation:-97}]}]
			},
			mapStyle:  'normal',
			sliderFx: 'fade',			// Slide effect. Can be 'slide' or 'fade'
			sliderInterval: 8000,		//Interval between slide change. Set 0 to disable auto slideshow 
			sliderSpeed: 1000,			//Speed of the effect in milliseconds
			countdownTo: '2014/01/01',	//Change this to your desired date in the format: 'YYYY/MM/DD'
			popupOpacity: 0.6,
			
			mp4: 'video/christmas_snow.mp4',
			ogv: 'video/christmas_snow.ogv',
			webm:'video/christmas_snow.webm',
			poster: 'video/christmas_snow.jpg'
		};
	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = $(element);
		this.options = $.extend({}, defaults, options);
		this.init();
	}
	Plugin.prototype = {
		init: function () {
			this.win = $(window);
			this.wrapper = $('.wrap');
			this.slider = $('#slides');
			this.video = $('#video');
			this.timer = $('#countdown');
			this.team = $('#our_team');
			this.newsletter = $('#newsletter');
			this.contact = $('#contact');
			this.map = $('#gmap');
			this.tweets = $('#tweets');
			this.contactForm = this.contact.find('form');
			this.subscribeForm = this.newsletter.find('form');
			this.contactForm.find('.form-loader').hide();
			this.activate();
			this.bind();
		},
		bind: function () {
			var instance = this;
			this.win.on('throttledresize', function () {
				var windowWidth = instance.win.width(),
					popupWidth = windowWidth - 20;
				if (windowWidth > 900) {
					instance.contact.width(900);
				}
				else {
					instance.contact.width(popupWidth);
				}
				instance.vertical_center();
			})
			this.win.trigger('resize');
			this.vertical_center();
		},
		vertical_center: function(){
			var windowHeight = this.win.height(),
				wrapHeight = this.wrapper.height(),
				diff = windowHeight - wrapHeight;
			
			if(diff > 40 ) {
				var margin = Math.floor(diff/2);
				this.wrapper.css({
					'margin-top' : margin + 'px',
					'margin-bottom' : margin + 'px'
				});
				
			}
			else {
				this.wrapper.css({
					'margin-top' : '20px',
					'margin-bottom' : '20px'
				});
			}
			
		},
		activate: function () {
			var instance = this;
			
			// Activate the slider
			if (this.slider.length == 1) {
				this.slider.superslides({
					animation: instance.options.sliderFx,
					play: instance.options.sliderInterval,
					animation_speed: instance.options.sliderSpeed
				});
			}
			// Activate the video
			if (this.video.length == 1) {
				this.video.videoBG({
					mp4: instance.options.mp4,
					ogv: instance.options.ogv,
					webm:instance.options.webm,
					poster:instance.options.poster,
					opacity:1
				});
			}
			
			// Run the countdown
			if (this.timer.length == 1) {
				this.timer.countdown(instance.options.countdownTo, function (event) {
					$(this).html(event.strftime(
						'<div><span>%D</span> day%!D</div>' + '<div><span>%H</span> hour%!H</div>' + '<div><span>%M</span> minute%!M</div>' + '<div><span>%S</span> second%!S</div>'));
				});
			}
			// Our Team Popup
			if (this.team.length > 0) {
				this.team.popup({
					opacity: instance.options.popupOpacity
				});
			}
			// Newsletter Popup
			if (this.newsletter.length > 0) {
				this.newsletter.popup({
					opacity: instance.options.popupOpacity,
					//autoopen: true //Uncomment this line make the popup open on page load
				});
			}
			
			// Prepare Map
			if(this.map.length == 1) {
				instance.options.centerAt[0] = this.map.data('lat');
				instance.options.centerAt[1] = this.map.data('lon');
				
				var mapStyle = this.map.data('style');
				this.options.mapStyle = mapStyle ? this.options.mapStyles[mapStyle] : null;
				
				this.options.mapStyles['grayscale']
				var markers		= this.map.find('.marker'),
					locations	= new Array();
				markers.each(function(){
					var marker = $(this),
						location = {};
					location.html	= marker.html().replace(/\n/g, '');
					location.lat	= marker.data('lat');
					location.lon	= marker.data('lon');
					location.title	= marker.data('title');
					if(location.lat && location.lon && location.title)
						locations.push(location);
					marker.remove();
				});
				instance.options.locations = locations;
			}

			// Contact Popup
			if (this.contact.length > 0) {
				this.contact.popup({
					opacity: instance.options.popupOpacity,
					onOpen: function () {
						new Maplace({
							map_options: {
								mapTypeControl: false,
								streetViewControl: false,
								zoomControl: false,
								set_center: instance.options.centerAt,
								zoom: 13,
								mapTypeId: google.maps.MapTypeId.ROADMAP,
								styles: instance.options.mapStyle
							},
							locations: instance.options.locations,
							force_generate_controls: true,
							controls_type: 'list',
							view_all: false,
							map_div: instance.map
						}).Load();
					}
				});
			}
			// Twitter
			if (this.tweets.length > 0) {
				this.tweets.twittie({
					dateFormat: '%b. %d, %Y',
					template: '{{tweet}} <div class="date">{{date}}</div>',
					count: 1,
					hideReplies: true
				});
			}
			
			if(this.subscribeForm.length == 1) {
				this.subscribeForm.validatr({
					showall: true,
					location: 'top',
					valid: function(){
						var form = instance.subscribeForm,
							loader = form.find('.form-loader'),
							msgwrap = form.next(),
							url = form.attr('action'),
							email = form.find('input[type=email]'),
							data = form.serialize();
							
						url = url.replace('/post?', '/post-json?').concat('&c=?');
						var data = {};
						var dataArray = form.serializeArray();
						$.each(dataArray, function (index, item) {
							data[item.name] = item.value;
						});	
						$.ajax({
							url: url,
							data: data,
							success: function(resp){
								if(resp.result === 'success') {
									msgwrap.html('<p class="success">'+ resp.msg +'</p>');
								}
								else {
									var index = -1;
									var msg;
									try {
										var parts = resp.msg.split(' - ', 2);
										if (parts[1] === undefined) {
											msg = resp.msg;
										} else {
											var i = parseInt(parts[0], 10);
											if (i.toString() === parts[0]) {
												index = parts[0];
												msg = parts[1];
											} else {
												index = -1;
												msg = resp.msg;
											}
										}
									}
									catch (e) {
										index = -1;
										msg = resp.msg;
									}
									msgwrap.html('<p class="error">' + msg + '</p>');						
								}
								loader.fadeOut();
								form.slideUp(function () {
									msgwrap.slideDown();
								});
							},
							dataType: 'jsonp',
							error: function (resp, text) {
								alert('Oops! AJAX error: ' + text);
							}
						});
						return false;
					}
				});
			}
			
			if (this.contactForm.length == 1) {
				this.contactForm.validatr({
					showall: true,
					valid: function () {
						var form = instance.contactForm,
							loader = form.find('.form-loader'),
							msgwrap = form.next(),
							type = form.attr('method'),
							url = form.attr('action'),
							data = form.serialize();
						$.ajax({
							type: type,
							url: url,
							data: data,
							dataType: 'text',
							beforeSend: function () {
								loader.fadeIn();
							},
							success: function (data, textStatus, jqXHR) {
								loader.fadeOut();
								form.slideUp(function () {
									msgwrap.append(data).slideDown();
								});
							},
							error: function (jqXHR, textStatus, errorThrown) {
								loader.fadeOut();
								alert('Oops! AJAX error: ' + errorThrown);
							}
						});
						return false;
					}
				});
			}
		}
	};
	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName,
					new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);
jQuery(document).ready(function ($) {
	$('body').comingSoon();
});