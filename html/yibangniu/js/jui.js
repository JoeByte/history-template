/*!
 * jQuery UI 1.8.13
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function( $, undefined ) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "1.8.13",

	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
});

// plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.each( [ "Width", "Height" ], function( i, name ) {
	var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
		type = name.toLowerCase(),
		orig = {
			innerWidth: $.fn.innerWidth,
			innerHeight: $.fn.innerHeight,
			outerWidth: $.fn.outerWidth,
			outerHeight: $.fn.outerHeight
		};

	function reduce( elem, size, border, margin ) {
		$.each( side, function() {
			size -= parseFloat( $.curCSS( elem, "padding" + this, true) ) || 0;
			if ( border ) {
				size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true) ) || 0;
			}
			if ( margin ) {
				size -= parseFloat( $.curCSS( elem, "margin" + this, true) ) || 0;
			}
		});
		return size;
	}

	$.fn[ "inner" + name ] = function( size ) {
		if ( size === undefined ) {
			return orig[ "inner" + name ].call( this );
		}

		return this.each(function() {
			$( this ).css( type, reduce( this, size ) + "px" );
		});
	};

	$.fn[ "outer" + name] = function( size, margin ) {
		if ( typeof size !== "number" ) {
			return orig[ "outer" + name ].call( this, size );
		}

		return this.each(function() {
			$( this).css( type, reduce( this, size, true, margin ) + "px" );
		});
	};
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		var map = element.parentNode,
			mapName = map.name,
			img;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName )
		? !element.disabled
		: "a" == nodeName
			? element.href || isTabIndexNotNaN
			: isTabIndexNotNaN)
		// the element and all of its ancestors must be visible
		&& visible( element );
}

function visible( element ) {
	return !$( element ).parents().andSelf().filter(function() {
		return $.curCSS( this, "visibility" ) === "hidden" ||
			$.expr.filters.hidden( this );
	}).length;
}

$.extend( $.expr[ ":" ], {
	data: function( elem, i, match ) {
		return !!$.data( elem, match[ 3 ] );
	},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support
$(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );

	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	$.support.minHeight = div.offsetHeight === 100;
	$.support.selectstart = "onselectstart" in div;

	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});





// deprecated
$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var proto = $.ui[ module ].prototype;
			for ( var i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode ) {
				return;
			}
	
			for ( var i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},
	
	// will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
	contains: function( a, b ) {
		return document.compareDocumentPosition ?
			a.compareDocumentPosition( b ) & 16 :
			a !== b && a.contains( b );
	},
	
	// only used by resizable
	hasScroll: function( el, a ) {
	
		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}
	
		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;
	
		if ( el[ scroll ] > 0 ) {
			return true;
		}
	
		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},
	
	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );
/*!
 * jQuery UI Widget 1.8.13
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $, undefined ) {

// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			$( elem ).triggerHandler( "remove" );
		}
		_cleanData( elems );
	};
} else {
	var _remove = $.fn.remove;
	$.fn.remove = function( selector, keepData ) {
		return this.each(function() {
			if ( !keepData ) {
				if ( !selector || $.filter( selector, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						$( this ).triggerHandler( "remove" );
					});
				}
			}
			return _remove.call( $(this), selector, keepData );
		});
	};
}

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				// TODO: add this back in 1.9 and use $.error() (see #5972)
//				if ( !instance ) {
//					throw "cannot call methods on " + name + " prior to initialization; " +
//						"attempted to call method '" + options + "'";
//				}
//				if ( !$.isFunction( instance[options] ) ) {
//					throw "no such method '" + options + "' for " + name + " widget instance";
//				}
//				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var callback = this.options[ type ];

		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		data = data || {};

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );
/*!
 * jQuery UI Mouse 1.8.13
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var mouseHandled = false;
$(document).mousedown(function(e) {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	options: {
		cancel: ':input,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var self = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return self._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if (true === $.data(event.target, self.widgetName + '.preventClickEvent')) {
				    $.removeData(event.target, self.widgetName + '.preventClickEvent');
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if(mouseHandled) {return};

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var self = this,
			btnIsLeft = (event.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).parents().add(event.target).filter(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
			$.removeData(event.target, this.widgetName + '.preventClickEvent');
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return self._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return self._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();
		
		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target == this._mouseDownEvent.target) {
			    $.data(event.target, this.widgetName + '.preventClickEvent', true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
});

})(jQuery);
/*
 * jQuery UI Position 1.8.13
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Position
 */
(function( $, undefined ) {

$.ui = $.ui || {};

var horizontalPositions = /left|center|right/,
	verticalPositions = /top|center|bottom/,
	center = "center",
	_position = $.fn.position,
	_offset = $.fn.offset;

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var target = $( options.of ),
		targetElem = target[0],
		collision = ( options.collision || "flip" ).split( " " ),
		offset = options.offset ? options.offset.split( " " ) : [ 0, 0 ],
		targetWidth,
		targetHeight,
		basePosition;

	if ( targetElem.nodeType === 9 ) {
		targetWidth = target.width();
		targetHeight = target.height();
		basePosition = { top: 0, left: 0 };
	// TODO: use $.isWindow() in 1.9
	} else if ( targetElem.setTimeout ) {
		targetWidth = target.width();
		targetHeight = target.height();
		basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
	} else if ( targetElem.preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
		targetWidth = targetHeight = 0;
		basePosition = { top: options.of.pageY, left: options.of.pageX };
	} else {
		targetWidth = target.outerWidth();
		targetHeight = target.outerHeight();
		basePosition = target.offset();
	}

	// force my and at to have valid horizontal and veritcal positions
	// if a value is missing or invalid, it will be converted to center 
	$.each( [ "my", "at" ], function() {
		var pos = ( options[this] || "" ).split( " " );
		if ( pos.length === 1) {
			pos = horizontalPositions.test( pos[0] ) ?
				pos.concat( [center] ) :
				verticalPositions.test( pos[0] ) ?
					[ center ].concat( pos ) :
					[ center, center ];
		}
		pos[ 0 ] = horizontalPositions.test( pos[0] ) ? pos[ 0 ] : center;
		pos[ 1 ] = verticalPositions.test( pos[1] ) ? pos[ 1 ] : center;
		options[ this ] = pos;
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	// normalize offset option
	offset[ 0 ] = parseInt( offset[0], 10 ) || 0;
	if ( offset.length === 1 ) {
		offset[ 1 ] = offset[ 0 ];
	}
	offset[ 1 ] = parseInt( offset[1], 10 ) || 0;

	if ( options.at[0] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[0] === center ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[1] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[1] === center ) {
		basePosition.top += targetHeight / 2;
	}

	basePosition.left += offset[ 0 ];
	basePosition.top += offset[ 1 ];

	return this.each(function() {
		var elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseInt( $.curCSS( this, "marginLeft", true ) ) || 0,
			marginTop = parseInt( $.curCSS( this, "marginTop", true ) ) || 0,
			collisionWidth = elemWidth + marginLeft +
				( parseInt( $.curCSS( this, "marginRight", true ) ) || 0 ),
			collisionHeight = elemHeight + marginTop +
				( parseInt( $.curCSS( this, "marginBottom", true ) ) || 0 ),
			position = $.extend( {}, basePosition ),
			collisionPosition;

		if ( options.my[0] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[0] === center ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[1] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[1] === center ) {
			position.top -= elemHeight / 2;
		}

		// prevent fractions (see #5280)
		position.left = Math.round( position.left );
		position.top = Math.round( position.top );

		collisionPosition = {
			left: position.left - marginLeft,
			top: position.top - marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[i] ] ) {
				$.ui.position[ collision[i] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: offset,
					my: options.my,
					at: options.at
				});
			}
		});

		if ( $.fn.bgiframe ) {
			elem.bgiframe();
		}
		elem.offset( $.extend( position, { using: options.using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var win = $( window ),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft();
			position.left = over > 0 ? position.left - over : Math.max( position.left - data.collisionPosition.left, position.left );
		},
		top: function( position, data ) {
			var win = $( window ),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop();
			position.top = over > 0 ? position.top - over : Math.max( position.top - data.collisionPosition.top, position.top );
		}
	},

	flip: {
		left: function( position, data ) {
			if ( data.at[0] === center ) {
				return;
			}
			var win = $( window ),
				over = data.collisionPosition.left + data.collisionWidth - win.width() - win.scrollLeft(),
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					-data.targetWidth,
				offset = -2 * data.offset[ 0 ];
			position.left += data.collisionPosition.left < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
		},
		top: function( position, data ) {
			if ( data.at[1] === center ) {
				return;
			}
			var win = $( window ),
				over = data.collisionPosition.top + data.collisionHeight - win.height() - win.scrollTop(),
				myOffset = data.my[ 1 ] === "top" ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					-data.targetHeight,
				offset = -2 * data.offset[ 1 ];
			position.top += data.collisionPosition.top < 0 ?
				myOffset + atOffset + offset :
				over > 0 ?
					myOffset + atOffset + offset :
					0;
		}
	}
};

// offset setter from jQuery 1.4
if ( !$.offset.setOffset ) {
	$.offset.setOffset = function( elem, options ) {
		// set position first, in-case top/left are set even on static elem
		if ( /static/.test( $.curCSS( elem, "position" ) ) ) {
			elem.style.position = "relative";
		}
		var curElem   = $( elem ),
			curOffset = curElem.offset(),
			curTop    = parseInt( $.curCSS( elem, "top",  true ), 10 ) || 0,
			curLeft   = parseInt( $.curCSS( elem, "left", true ), 10)  || 0,
			props     = {
				top:  (options.top  - curOffset.top)  + curTop,
				left: (options.left - curOffset.left) + curLeft
			};
		
		if ( 'using' in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	};

	$.fn.offset = function( options ) {
		var elem = this[ 0 ];
		if ( !elem || !elem.ownerDocument ) { return null; }
		if ( options ) { 
			return this.each(function() {
				$.offset.setOffset( this, options );
			});
		}
		return _offset.call( this );
	};
}

}( jQuery ));
/*
 * jQuery UI Draggable 1.8.13
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.draggable", $.ui.mouse, {
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false
	},
	_create: function() {

		if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position")))
			this.element[0].style.position = 'relative';

		(this.options.addClasses && this.element.addClass("ui-draggable"));
		(this.options.disabled && this.element.addClass("ui-draggable-disabled"));

		this._mouseInit();

	},

	destroy: function() {
		if(!this.element.data('draggable')) return;
		this.element
			.removeData("draggable")
			.unbind(".draggable")
			.removeClass("ui-draggable"
				+ " ui-draggable-dragging"
				+ " ui-draggable-disabled");
		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle'))
			return false;

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle)
			return false;
		
		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>')
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css("position");
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.helper.addClass("ui-draggable-dragging");
		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;
	},

	_mouseDrag: function(event, noPropagation) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger('drag', event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			dropped = $.ui.ddmanager.drop(this, event);

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}
		
		//if the original element is removed, don't bother to continue if helper is set to "original"
		if((!this.element[0] || !this.element[0].parentNode) && this.options.helper == "original")
			return false;

		if((this.options.revert == "invalid" && !dropped) || (this.options.revert == "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			var self = this;
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if(self._trigger("stop", event) !== false) {
					self._clear();
				}
			});
		} else {
			if(this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},
	
	_mouseUp: function(event) {
		if (this.options.iframeFix === true) {
			$("div.ui-draggable-iframeFix").each(function() { 
				this.parentNode.removeChild(this); 
			}); //Remove frame helpers
		}
		
		return $.ui.mouse.prototype._mouseUp.call(this, event);
	},
	
	cancel: function() {
		
		if(this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}
		
		return this;
		
	},

	_getHandle: function(event) {

		var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
		$(this.options.handle, this.element)
			.find("*")
			.andSelf()
			.each(function() {
				if(this == event.target) handle = true;
			});

		return handle;

	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone().removeAttr('id') : this.element);

		if(!helper.parents('body').length)
			helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo));

		if(helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css("position")))
			helper.css("position", "absolute");

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0),
			right: (parseInt(this.element.css("marginRight"),10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			(o.containment == 'document' ? 0 : $(window).scrollLeft()) - this.offset.relative.left - this.offset.parent.left,
			(o.containment == 'document' ? 0 : $(window).scrollTop()) - this.offset.relative.top - this.offset.parent.top,
			(o.containment == 'document' ? 0 : $(window).scrollLeft()) + $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			(o.containment == 'document' ? 0 : $(window).scrollTop()) + ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array) {
		        var c = $(o.containment);
			var ce = c[0]; if(!ce) return;
			var co = c.offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				(parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0),
				(parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0),
				(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right,
				(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top  - this.margins.bottom
			];
			this.relative_container = c;

		} else if(o.containment.constructor == Array) {
			this.containment = o.containment;
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options
		         var containment;
		         if(this.containment) {
				 if (this.relative_container){
				     var co = this.relative_container.offset();
				     containment = [ this.containment[0] + co.left,
						     this.containment[1] + co.top,
						     this.containment[2] + co.left,
						     this.containment[3] + co.top ];
				 }
				 else {
				     containment = this.containment;
				 }

				if(event.pageX - this.offset.click.left < containment[0]) pageX = containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < containment[1]) pageY = containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > containment[2]) pageX = containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > containment[3]) pageY = containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = containment ? (!(top - this.offset.click.top < containment[1] || top - this.offset.click.top > containment[3]) ? top : (!(top - this.offset.click.top < containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = containment ? (!(left - this.offset.click.left < containment[0] || left - this.offset.click.left > containment[2]) ? left : (!(left - this.offset.click.left < containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] != this.element[0] && !this.cancelHelperRemoval) this.helper.remove();
		//if($.ui.ddmanager) $.ui.ddmanager.current = null;
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		if(type == "drag") this.positionAbs = this._convertPositionTo("absolute"); //The absolute position has to be recalculated after plugins
		return $.Widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function(event) {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.extend($.ui.draggable, {
	version: "1.8.13"
});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, 'sortable');
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable.refreshPositions();	// Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: 'valid/invalid'
				if(this.shouldRevert) this.instance.options.revert = true;

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper == 'original')
					this.instance.currentItem.css({ top: 'auto', left: 'auto' });

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("draggable"), self = this;

		var checkPos = function(o) {
			var dyClick = this.offset.click.top, dxClick = this.offset.click.left;
			var helperTop = this.positionAbs.top, helperLeft = this.positionAbs.left;
			var itemHeight = o.height, itemWidth = o.width;
			var itemTop = o.top, itemLeft = o.left;

			return $.ui.isOver(helperTop + dyClick, helperLeft + dxClick, itemTop, itemLeft, itemHeight, itemWidth);
		};

		$.each(inst.sortables, function(i) {
			
			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;
			
			if(this.instance._intersectsWith(this.instance.containerCache)) {

				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(self).clone().removeAttr('id').appendTo(this.instance.element).data("sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) this.instance._mouseDrag(event);

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;
					
					//Prevent reverting on this forced stop
					this.instance.options.revert = false;
					
					// The out event needs to be triggered independently
					this.instance._trigger('out', event, this.instance._uiHash(this.instance));
					
					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) this.instance.placeholder.remove();

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			};

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function(event, ui) {
		var t = $('body'), o = $(this).data('draggable').options;
		if (t.css("cursor")) o._cursor = t.css("cursor");
		t.css("cursor", o.cursor);
	},
	stop: function(event, ui) {
		var o = $(this).data('draggable').options;
		if (o._cursor) $('body').css("cursor", o._cursor);
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data('draggable').options;
		if(t.css("opacity")) o._opacity = t.css("opacity");
		t.css('opacity', o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data('draggable').options;
		if(o._opacity) $(ui.helper).css('opacity', o._opacity);
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function(event, ui) {
		var i = $(this).data("draggable");
		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') i.overflowOffset = i.scrollParent.offset();
	},
	drag: function(event, ui) {

		var i = $(this).data("draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {

			if(!o.axis || o.axis != 'x') {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
			}

			if(!o.axis || o.axis != 'y') {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
			}

		} else {

			if(!o.axis || o.axis != 'x') {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
			}

			if(!o.axis || o.axis != 'y') {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(i, event);

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function(event, ui) {

		var i = $(this).data("draggable"), o = i.options;
		i.snapElements = [];

		$(o.snap.constructor != String ? ( o.snap.items || ':data(draggable)' ) : o.snap).each(function() {
			var $t = $(this); var $o = $t.offset();
			if(this != i.element[0]) i.snapElements.push({
				item: this,
				width: $t.outerWidth(), height: $t.outerHeight(),
				top: $o.top, left: $o.left
			});
		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("draggable"), o = inst.options;
		var d = o.snapTolerance;

		var x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (var i = inst.snapElements.length - 1; i >= 0; i--){

			var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width,
				t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;

			//Yes, I know, this is insane ;)
			if(!((l-d < x1 && x1 < r+d && t-d < y1 && y1 < b+d) || (l-d < x1 && x1 < r+d && t-d < y2 && y2 < b+d) || (l-d < x2 && x2 < r+d && t-d < y1 && y1 < b+d) || (l-d < x2 && x2 < r+d && t-d < y2 && y2 < b+d))) {
				if(inst.snapElements[i].snapping) (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode != 'inner') {
				var ts = Math.abs(t - y2) <= d;
				var bs = Math.abs(b - y1) <= d;
				var ls = Math.abs(l - x2) <= d;
				var rs = Math.abs(r - x1) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
			}

			var first = (ts || bs || ls || rs);

			if(o.snapMode != 'outer') {
				var ts = Math.abs(t - y1) <= d;
				var bs = Math.abs(b - y2) <= d;
				var ls = Math.abs(l - x1) <= d;
				var rs = Math.abs(r - x2) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		};

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function(event, ui) {

		var o = $(this).data("draggable").options;

		var group = $.makeArray($(o.stack)).sort(function(a,b) {
			return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
		});
		if (!group.length) { return; }
		
		var min = parseInt(group[0].style.zIndex) || 0;
		$(group).each(function(i) {
			this.style.zIndex = min + i;
		});

		this[0].style.zIndex = min + group.length;

	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("draggable").options;
		if(t.css("zIndex")) o._zIndex = t.css("zIndex");
		t.css('zIndex', o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("draggable").options;
		if(o._zIndex) $(ui.helper).css('zIndex', o._zIndex);
	}
});

})(jQuery);
/*
 * jQuery UI Sortable 1.8.13
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.sortable", $.ui.mouse, {
	widgetEventPrefix: "sort",
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: 'auto',
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: '> *',
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are being displayed horizontally
		this.floating = this.items.length ? o.axis === 'x' || (/left|right/).test(this.items[0].item.css('float')) || (/inline|table-cell/).test(this.items[0].item.css('display')) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

	},

	destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled")
			.removeData("sortable")
			.unbind(".sortable");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- )
			this.items[i].item.removeData("sortable-item");

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;
	
			this.widget()
				[ value ? "addClass" : "removeClass"]( "ui-sortable-disabled" );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type == 'static') return false;

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		var currentItem = null, self = this, nodes = $(event.target).parents().each(function() {
			if($.data(this, 'sortable-item') == self) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, 'sortable-item') == self) currentItem = $(event.target);

		if(!currentItem) return false;
		if(this.options.handle && !overrideHandle) {
			var validHandle = false;

			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
			if(!validHandle) return false;
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var o = this.options, self = this;
		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] != this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		if(o.cursor) { // cursor option
			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
			$('body').css("cursor", o.cursor);
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
			this.overflowOffset = this.scrollParent.offset();

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions)
			this._cacheHelperProportions();


		//Post 'activate' events to possible containers
		if(!noActivation) {
			 for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, self._uiHash(this)); }
		}

		//Prepare possible droppables
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			var o = this.options, scrolled = false;
			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
				$.ui.ddmanager.prepareOffsets(this, event);
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

		//Rearrange
		for (var i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
			if (!intersection) continue;

			if(itemElement != this.currentItem[0] //cannot intersect with itself
				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
				&&	!$.ui.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
				&& (this.options.type == 'semi-dynamic' ? !$.ui.contains(this.element[0], itemElement) : true)
				//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
			) {

				this.direction = intersection == 1 ? "down" : "up";

				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		//Call callbacks
		this._trigger('sort', event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) return;

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			$.ui.ddmanager.drop(this, event);

		if(this.options.revert) {
			var self = this;
			var cur = self.placeholder.offset();

			self.reverting = true;

			$(this.helper).animate({
				left: cur.left - this.offset.parent.left - self.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
				top: cur.top - this.offset.parent.top - self.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
			}, parseInt(this.options.revert, 10) || 500, function() {
				self._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		var self = this;

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper == "original")
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			else
				this.currentItem.show();

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, self._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, self._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var str = []; o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
		});

		if(!str.length && o.key) {
			str.push(o.key + '=');
		}

		return str.join('&');

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var ret = []; o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height;

		var l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height;

		var dyClick = this.offset.click.top,
			dxClick = this.offset.click.left;

		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

		if(	   this.options.tolerance == "pointer"
			|| this.options.forcePointerForContainers
			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) // Right Half
				&& x2 - (this.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement)
			return false;

		return this.floating ?
			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta != 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta != 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor == String
			? [options.connectWith]
			: options.connectWith;
	},
	
	_getItemsAsjQuery: function(connected) {

		var self = this;
		var items = [];
		var queries = [];
		var connectWith = this._connectWith();

		if(connectWith && connected) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
					}
				};
			};
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);

		for (var i = queries.length - 1; i >= 0; i--){
			queries[i][0].each(function() {
				items.push(this);
			});
		};

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(sortable-item)");

		for (var i=0; i < this.items.length; i++) {

			for (var j=0; j < list.length; j++) {
				if(list[j] == this.items[i].item[0])
					this.items.splice(i,1);
			};

		};

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];
		var items = this.items;
		var self = this;
		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
		var connectWith = this._connectWith();

		if(connectWith) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				};
			};
		}

		for (var i = queries.length - 1; i >= 0; i--) {
			var targetData = queries[i][1];
			var _queries = queries[i][0];

			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				var item = $(_queries[j]);

				item.data('sortable-item', targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			};
		};

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		for (var i = this.items.length - 1; i >= 0; i--){
			var item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance != this.currentContainer && this.currentContainer && item.item[0] != this.currentItem[0])
				continue;

			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			var p = t.offset();
			item.left = p.left;
			item.top = p.top;
		};

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (var i = this.containers.length - 1; i >= 0; i--){
				var p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			};
		}

		return this;
	},

	_createPlaceholder: function(that) {

		var self = that || this, o = self.options;

		if(!o.placeholder || o.placeholder.constructor == String) {
			var className = o.placeholder;
			o.placeholder = {
				element: function() {

					var el = $(document.createElement(self.currentItem[0].nodeName))
						.addClass(className || self.currentItem[0].className+" ui-sortable-placeholder")
						.removeClass("ui-sortable-helper")[0];

					if(!className)
						el.style.visibility = "hidden";

					return el;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) return;

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10)); };
					if(!p.width()) { p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10)); };
				}
			};
		}

		//Create the placeholder
		self.placeholder = $(o.placeholder.element.call(self.element, self.currentItem));

		//Append it after the actual current item
		self.currentItem.after(self.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(self, self.placeholder);

	},

	_contactContainers: function(event) {
		
		// get innermost container that intersects with item 
		var innermostContainer = null, innermostIndex = null;		
		
		
		for (var i = this.containers.length - 1; i >= 0; i--){

			// never consider a container that's located within the item itself 
			if($.ui.contains(this.currentItem[0], this.containers[i].element[0]))
				continue;

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue 
				if(innermostContainer && $.ui.contains(this.containers[i].element[0], innermostContainer.element[0]))
					continue;

				innermostContainer = this.containers[i]; 
				innermostIndex = i;
					
			} else {
				// container doesn't intersect. trigger "out" event if necessary 
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}
		
		// if no intersecting containers found, return 
		if(!innermostContainer) return; 

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		} else if(this.currentContainer != this.containers[innermostIndex]) { 

			//When entering a new container, we will find the item with the least distance and append our item near it 
			var dist = 10000; var itemWithLeastDistance = null; var base = this.positionAbs[this.containers[innermostIndex].floating ? 'left' : 'top']; 
			for (var j = this.items.length - 1; j >= 0; j--) { 
				if(!$.ui.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue; 
				var cur = this.items[j][this.containers[innermostIndex].floating ? 'left' : 'top']; 
				if(Math.abs(cur - base) < dist) { 
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j]; 
				} 
			} 

			if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled 
				return; 

			this.currentContainer = this.containers[innermostIndex]; 
			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true); 
			this._trigger("change", event, this._uiHash()); 
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this)); 

			//Update the placeholder 
			this.options.placeholder.update(this.currentContainer, this.placeholder); 
		
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this)); 
			this.containers[innermostIndex].containerCache.over = 1;
		} 
	
		
	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

		if(helper[0] == this.currentItem[0])
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

		if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
		if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			var ce = $(o.containment)[0];
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var self = this, counter = this.counter;

		window.setTimeout(function() {
			if(counter == self.counter) self.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
		},0);

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var delayedTriggers = [], self = this;

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem[0].parentNode) this.placeholder.before(this.currentItem);
		this._noFinalSort = null;

		if(this.helper[0] == this.currentItem[0]) {
			for(var i in this._storedCSS) {
				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		if(!$.ui.contains(this.element[0], this.currentItem[0])) { //Node was moved out of the current element
			if(!noPropagation) delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
			for (var i = this.containers.length - 1; i >= 0; i--){
				if($.ui.contains(this.containers[i].element[0], this.currentItem[0]) && !noPropagation) {
					delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
					delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.containers[i]));
				}
			};
		};

		//Post events to containers
		for (var i = this.containers.length - 1; i >= 0; i--){
			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}
			return false;
		}

		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

		if(!noPropagation) {
			for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(inst) {
		var self = inst || this;
		return {
			helper: self.helper,
			placeholder: self.placeholder || $([]),
			position: self.position,
			originalPosition: self.originalPosition,
			offset: self.positionAbs,
			item: self.currentItem,
			sender: inst ? inst.element : null
		};
	}

});

$.extend($.ui.sortable, {
	version: "1.8.13"
});

})(jQuery);

/*
 * jQuery UI Slider 1.8.13
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

// number of pages in a slider
// (how many times can you page up/down to go through the whole range)
var numPages = 5;

$.widget( "ui.slider", $.ui.mouse, {

	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null
	},

	_create: function() {
		var self = this,
			o = this.options,
			existingHandles = this.element.find( ".ui-slider-handle" ).addClass( "ui-state-default ui-corner-all" ),
			handle = "<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",
			handleCount = ( o.values && o.values.length ) || 1,
			handles = [];

		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" +
				( o.disabled ? " ui-slider-disabled ui-disabled" : "" ) );

		this.range = $([]);

		if ( o.range ) {
			if ( o.range === true ) {
				if ( !o.values ) {
					o.values = [ this._valueMin(), this._valueMin() ];
				}
				if ( o.values.length && o.values.length !== 2 ) {
					o.values = [ o.values[0], o.values[0] ];
				}
			}

			this.range = $( "<div></div>" )
				.appendTo( this.element )
				.addClass( "ui-slider-range" +
				// note: this isn't the most fittingly semantic framework class for this element,
				// but worked best visually with a variety of themes
				" ui-widget-header" + 
				( ( o.range === "min" || o.range === "max" ) ? " ui-slider-range-" + o.range : "" ) );
		}

		for ( var i = existingHandles.length; i < handleCount; i += 1 ) {
			handles.push( handle );
		}

		this.handles = existingHandles.add( $( handles.join( "" ) ).appendTo( self.element ) );

		this.handle = this.handles.eq( 0 );

		this.handles.add( this.range ).filter( "a" )
			.click(function( event ) {
				event.preventDefault();
			})
			.hover(function() {
				if ( !o.disabled ) {
					$( this ).addClass( "ui-state-hover" );
				}
			}, function() {
				$( this ).removeClass( "ui-state-hover" );
			})
			.focus(function() {
				if ( !o.disabled ) {
					$( ".ui-slider .ui-state-focus" ).removeClass( "ui-state-focus" );
					$( this ).addClass( "ui-state-focus" );
				} else {
					$( this ).blur();
				}
			})
			.blur(function() {
				$( this ).removeClass( "ui-state-focus" );
			});

		this.handles.each(function( i ) {
			$( this ).data( "index.ui-slider-handle", i );
		});

		this.handles
			.keydown(function( event ) {
				var ret = true,
					index = $( this ).data( "index.ui-slider-handle" ),
					allowed,
					curVal,
					newVal,
					step;
	
				if ( self.options.disabled ) {
					return;
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.END:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						ret = false;
						if ( !self._keySliding ) {
							self._keySliding = true;
							$( this ).addClass( "ui-state-active" );
							allowed = self._start( event, index );
							if ( allowed === false ) {
								return;
							}
						}
						break;
				}
	
				step = self.options.step;
				if ( self.options.values && self.options.values.length ) {
					curVal = newVal = self.values( index );
				} else {
					curVal = newVal = self.value();
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
						newVal = self._valueMin();
						break;
					case $.ui.keyCode.END:
						newVal = self._valueMax();
						break;
					case $.ui.keyCode.PAGE_UP:
						newVal = self._trimAlignValue( curVal + ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.PAGE_DOWN:
						newVal = self._trimAlignValue( curVal - ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
						if ( curVal === self._valueMax() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal + step );
						break;
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						if ( curVal === self._valueMin() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal - step );
						break;
				}
	
				self._slide( event, index, newVal );
	
				return ret;
	
			})
			.keyup(function( event ) {
				var index = $( this ).data( "index.ui-slider-handle" );
	
				if ( self._keySliding ) {
					self._keySliding = false;
					self._stop( event, index );
					self._change( event, index );
					$( this ).removeClass( "ui-state-active" );
				}
	
			});

		this._refreshValue();

		this._animateOff = false;
	},

	destroy: function() {
		this.handles.remove();
		this.range.remove();

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-slider-disabled" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" )
			.removeData( "slider" )
			.unbind( ".slider" );

		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function( event ) {
		var o = this.options,
			position,
			normValue,
			distance,
			closestHandle,
			self,
			index,
			allowed,
			offset,
			mouseOverHandle;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		self = this;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - self.values(i) );
			if ( distance > thisDistance ) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		// workaround for bug #3736 (if both handles of a range are at 0,
		// the first is always used as the one with least distance,
		// and moving it is obviously prevented by preventing negative ranges)
		if( o.range === true && this.values(1) === o.min ) {
			index += 1;
			closestHandle = $( this.handles[index] );
		}

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		self._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();
		
		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().andSelf().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		if ( !this.handles.hasClass( "ui-state-hover" ) ) {
			this._slide( event, index, normValue );
		}
		this._animateOff = true;
		return true;
	},

	_mouseStart: function( event ) {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );
		
		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},
	
	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) && 
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal, true );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
			return;
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
			return;
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		$.Widget.prototype._setOption.apply( this, arguments );

		switch ( key ) {
			case "disabled":
				if ( value ) {
					this.handles.filter( ".ui-state-focus" ).blur();
					this.handles.removeClass( "ui-state-hover" );
					this.handles.attr( "disabled", "disabled" );
					this.element.addClass( "ui-disabled" );
				} else {
					this.handles.removeAttr( "disabled" );
					this.element.removeClass( "ui-disabled" );
				}
				break;
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i+= 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		}
	},
	
	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val <= this._valueMin() ) {
			return this._valueMin();
		}
		if ( val >= this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = (val - this._valueMin()) % step;
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.options.max;
	},
	
	_refreshValue: function() {
		var oRange = this.options.range,
			o = this.options,
			self = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			valPercent,
			_set = {},
			lastValPercent,
			value,
			valueMin,
			valueMax;

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i, j ) {
				valPercent = ( self.values(i) - self._valueMin() ) / ( self._valueMax() - self._valueMin() ) * 100;
				_set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( self.options.range === true ) {
					if ( self.orientation === "horizontal" ) {
						if ( i === 0 ) {
							self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							self.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							self.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	}

});

$.extend( $.ui.slider, {
	version: "1.8.13"
});

}(jQuery));


/* Copyright (c) 2006 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * $LastChangedDate: 2007-07-21 18:44:59 -0500 (Sat, 21 Jul 2007) $
 * $Rev: 2446 $
 *
 * Version 2.1.1
 */

(function($){

/**
 * The bgiframe is chainable and applies the iframe hack to get 
 * around zIndex issues in IE6. It will only apply itself in IE6 
 * and adds a class to the iframe called 'bgiframe'. The iframe
 * is appeneded as the first child of the matched element(s) 
 * with a tabIndex and zIndex of -1.
 * 
 * By default the plugin will take borders, sized with pixel units,
 * into account. If a different unit is used for the border's width,
 * then you will need to use the top and left settings as explained below.
 *
 * NOTICE: This plugin has been reported to cause perfromance problems
 * when used on elements that change properties (like width, height and
 * opacity) a lot in IE6. Most of these problems have been caused by 
 * the expressions used to calculate the elements width, height and 
 * borders. Some have reported it is due to the opacity filter. All 
 * these settings can be changed if needed as explained below.
 *
 * @example $('div').bgiframe();
 * @before <div><p>Paragraph</p></div>
 * @result <div><iframe class="bgiframe".../><p>Paragraph</p></div>
 *
 * @param Map settings Optional settings to configure the iframe.
 * @option String|Number top The iframe must be offset to the top
 * 		by the width of the top border. This should be a negative 
 *      number representing the border-top-width. If a number is 
 * 		is used here, pixels will be assumed. Otherwise, be sure
 *		to specify a unit. An expression could also be used. 
 * 		By default the value is "auto" which will use an expression 
 * 		to get the border-top-width if it is in pixels.
 * @option String|Number left The iframe must be offset to the left
 * 		by the width of the left border. This should be a negative 
 *      number representing the border-left-width. If a number is 
 * 		is used here, pixels will be assumed. Otherwise, be sure
 *		to specify a unit. An expression could also be used. 
 * 		By default the value is "auto" which will use an expression 
 * 		to get the border-left-width if it is in pixels.
 * @option String|Number width This is the width of the iframe. If
 *		a number is used here, pixels will be assume. Otherwise, be sure
 * 		to specify a unit. An experssion could also be used.
 *		By default the value is "auto" which will use an experssion
 * 		to get the offsetWidth.
 * @option String|Number height This is the height of the iframe. If
 *		a number is used here, pixels will be assume. Otherwise, be sure
 * 		to specify a unit. An experssion could also be used.
 *		By default the value is "auto" which will use an experssion
 * 		to get the offsetHeight.
 * @option Boolean opacity This is a boolean representing whether or not
 * 		to use opacity. If set to true, the opacity of 0 is applied. If
 *		set to false, the opacity filter is not applied. Default: true.
 * @option String src This setting is provided so that one could change 
 *		the src of the iframe to whatever they need.
 *		Default: "javascript:false;"
 *
 * @name bgiframe
 * @type jQuery
 * @cat Plugins/bgiframe
 * @author Brandon Aaron (brandon.aaron@gmail.com || http://brandonaaron.net)
 */
$.fn.bgIframe = $.fn.bgiframe = function(s) {
	// This is only for IE6
	if ($.isIE6) {
		s = $.extend({
			top     : 'auto', // auto == .currentStyle.borderTopWidth
			left    : 'auto', // auto == .currentStyle.borderLeftWidth
			width   : 'auto', // auto == offsetWidth
			height  : 'auto', // auto == offsetHeight
			opacity : true,
			src     : 'javascript:false;'
		}, s || {});
		var prop = function(n){return n&&n.constructor==Number?n+'px':n;},
		    html = '<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"'+
		               'style="display:block;position:absolute;z-index:-1;'+
			               (s.opacity !== false?'filter:Alpha(Opacity=\'0\');':'')+
					       'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+
					       'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+
					       'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+
					       'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+
					'"/>';
		return this.each(function() {
			if ( $('> iframe.bgiframe', this).length == 0 )
				this.insertBefore( document.createElement(html), this.firstChild );
		});
	}
	return this;
};

})(jQuery);

/************************* end jquery.ui *****************************/

/*
 * 弹出层核心代码，不会直接调用
 * artDialog 4.1.0
 * Date: 2011-08-06 22:10
 * http://code.google.com/p/artdialog/
 * (c) 2009-2010 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://creativecommons.org/licenses/LGPL/2.1/
 * @修改 {
 * 		1.去掉resize和拖拽模块
 * 		2.'<a class="aui_close" href="javascript:void(0);">',
 *		3.'<tr style="display:none;"><td colspan="2" class="aui_header">' 将模版的header、footer所属 tr 设为 display:none;
 * }
 */
 
;(function ($, window, undefined) {

var _box, _thisScript, _skin, _path,
	_count = 0,
	_$window = $(window),
	_$document = $(document),
	_$html = $('html'),
	_$body = $(function(){_$body = $('body')}),
	_elem = document.documentElement,
	_isIE6 = !-[1,] && !('minWidth' in _elem.style),
	_isMobile = 'createTouch' in document && !('onmousemove' in _elem)
		|| /(iPhone|iPad|iPod)/i.test(navigator.userAgent),
	_eventDown = _isMobile ? 'touchstart' : 'mousedown',
	_expando = 'artDialog' + (new Date).getTime();

var artDialog = function (config, yesFn, noFn) {
	config = config || {};
	if (typeof config === 'string' || config.nodeType === 1) {
		config = {content: config, fixed: !_isMobile};
	};
	
	var api, buttons = [],
		defaults = artDialog.defaults,
		elem = config.follow = this.nodeType === 1 && this || config.follow;
		
	// 合并默认配置
	for (var i in defaults) {
		if (config[i] === undefined) config[i] = defaults[i];		
	};
	
	// 返回跟随模式或重复定义的ID
	if (typeof elem === 'string') elem = $(elem)[0];
	config.id = elem && elem[_expando + 'follow'] || config.id || _expando + _count;
	api = artDialog.list[config.id];
	if (elem && api) return api.follow(elem).zIndex().focus();
	if (api) return api.zIndex();
	
	// 目前主流移动设备对fixed支持不好
	if (_isMobile) config.fixed = false;
	
	// 按钮队列
	if (!$.isArray(config.button)) {
		config.button = config.button ? [config.button] : [];
	};
	yesFn = yesFn || config.yesFn;
	noFn = noFn || config.noFn;
	yesFn && config.button.push({
		name: config.yesText,
		callback: yesFn,
		focus: true
	});
	noFn && config.button.push({
		name: config.noText,
		callback: noFn
	});
	
	// zIndex全局配置
	artDialog.defaults.zIndex = config.zIndex;
	
	_count ++;
	return artDialog.list[config.id] = _box ?
		_box._init(config) : new artDialog.fn._init(config);
};

artDialog.fn = artDialog.prototype = {

	version: '4.1.0',
	
	_init: function (config) {
		var that = this, DOM,
			icon = config.icon,
			iconBg = icon && (_isIE6 ? {png: 'icons/' + icon + '.png'}
			: {backgroundImage: 'url(\'' + config.path + '/skins/icons/' + icon + '.png\')'});
		
		that.config = config;
		that._listeners = {};
		that._fixed = _isIE6 ? false : config.fixed;
		that._elemBack = that._timer = that._focus = that._isClose = that._lock = null;
		
		DOM = that.DOM = that.DOM || that._getDOM();
		DOM.wrap.addClass(config.skin);
		DOM.close[config.noFn === false ? 'hide' : 'show']();
		DOM.icon[0].style.display = icon ? '' : 'none';
		DOM.iconBg.css(iconBg || {background: 'none'});
		DOM.content.css('padding', config.padding);
		
		that[config.show ? 'show' : 'hide'](true)
		.button(config.button)
		.title(config.title)
		.content(config.content)
		.size(config.width, config.height)
		.zIndex(config.zIndex)
		.time(config.time);
		
		config.follow
		? that.follow(config.follow)
		: that.position(config.left, config.top);
		
		config.lock && that.lock();
		config.focus && that.focus();
		
		that._addEvent();
		_isIE6 && that._pngFix();
		_box = null;
		
		config.initFn && config.initFn.call(that, window);
		return that;
	},
	
	/**
	 * 设置内容
	 * @param	{String, HTMLElement}	内容 (可选)
	 * @return	{this, HTMLElement}				如果无参数则返回内容容器DOM对象
	 */
	content: function (msg) {
		var prev, next, parent, display,
			that = this,
			content = that.DOM.content,
			elem = content[0];
		
		that._elemBack = null;
		
		if (msg === undefined) {
			return elem;
		} else if (typeof msg === 'string') {
			content.html(msg);
		} else if (msg && msg.nodeType === 1) {
		
			// 让传入的元素在对话框关闭后可以返回到原来的地方
			display = msg.style.display;
			prev = msg.previousSibling;
			next = msg.nextSibling;
			parent = msg.parentNode;
			that._elemBack = function () {
				if (prev && prev.parentNode) {
					prev.parentNode.insertBefore(msg, prev.nextSibling);
				} else if (next && prev.parentNode) {
					next.parentNode.insertBefore(msg, next);
				} else if (parent) {
					parent.appendChild(msg);
				};
				msg.style.display = display;
			};
			
			content.html('');
			elem.appendChild(msg);
			msg.style.display = 'block';
			
		};
		
		_isIE6 && that._selectFix();
		that._runScript(elem);
		
		return that;
	},
	
	/**
	 * 设置标题
	 * @param	{String, Boolean}	标题内容. 为false则隐藏标题栏
	 * @return	{this, HTMLElement}	如果无参数则返回内容器DOM对象
	 */
	title: function (text) {
		var DOM = this.DOM,
			wrap = DOM.wrap,
			title = DOM.title,
			className = 'aui_state_noTitle';
			
		if (text === undefined) {
			return title[0];
		};
		
		if (text === false) {
			title.hide().html('');
			wrap.addClass(className);
		} else {
			title.show().html(text);
			wrap.removeClass(className);
		};
		
		return this;
	},
	
	/**
	 * 位置
	 * @param	{Number, String}
	 * @param	{Number, String}
	 */
	position: function (left, top) {
		var that = this,
			config = that.config,
			wrap = that.DOM.wrap,
			ie6Fixed = _isIE6 && that.config.fixed,
			docLeft = _$document.scrollLeft(),
			docTop = _$document.scrollTop(),
			dl = that._fixed ? 0 : docLeft,
			dt = that._fixed ? 0 : docTop,
			ww = _$window.width(),
			wh = _$window.height(),
			ow = wrap[0].offsetWidth,
			oh = wrap[0].offsetHeight,
			style = wrap[0].style;
		
		if (!left && left !== 0) left = config.left;
		if (!top && top !== 0) top = config.top;
		config.left = left;
		config.top = top;
		
		left = that._toNumber(left, ww - ow);
		if (typeof left === 'number') left = ie6Fixed ? (left += docLeft) : left + dl;

		if (top === 'goldenRatio') {
			// 黄金比例垂直居中
			top = (oh < 4 * wh / 7 ? wh * 0.382 - oh / 2 : (wh - oh) / 2) + dt;
		} else {
			top = that._toNumber(top, wh - oh);
			if (typeof top === 'number') top = ie6Fixed ? (top += docTop) : top + dt;
		};
		
		if (typeof left === 'number') {
			style.left = Math.max(left, dl) + 'px';
		} else if (typeof left === 'string') {
			style.left = left;
		};
		
		if (typeof top === 'number') {
			style.top = Math.max(top, dt) + 'px';
		} else if (typeof top === 'string') {
			style.top = top;
		};
		
		/*that.config.follow = null;*/
		that._autoPositionType();
		
		return that;
	},
	
	/**
	 *	尺寸
	 *	@param	{Number, String}	宽度
	 *	@param	{Number, String}	高度
	 *	@return	this
	 */
	size: function (width, height) {
		var maxWidth, maxHeight, scaleWidth, scaleHeight,
			that = this,
			config = that.config,
			DOM = that.DOM,
			wrap = DOM.wrap,
			main = DOM.main,
			wrapStyle = wrap[0].style,
			style = main[0].style;
			
		if (!width && width !== 0) width = config.width;
		if (!height && height !== 0) height = config.height;
				
		maxWidth = _$window.width() - wrap[0].offsetWidth + main[0].offsetWidth;
		scaleWidth = that._toNumber(width, maxWidth);
		config.width = width;
		width = scaleWidth;
		
		maxHeight = _$window.height() - wrap[0].offsetHeight + main[0].offsetHeight;
		scaleHeight = that._toNumber(height, maxHeight);
		config.height = height;
		height = scaleHeight;
		
		if (typeof width === 'number') {
			wrapStyle.width = 'auto';
			style.width = Math.max(that.config.minWidth, width) + 'px';
			wrapStyle.width = wrap[0].offsetWidth + 'px'; // 防止未定义宽度的表格遇到浏览器右边边界伸缩
		} else if (typeof width === 'string') {
			style.width = width;
			width === 'auto' && wrap.css('width', 'auto');
		};
		
		if (typeof height === 'number') {
			style.height = Math.max(that.config.minHeight, height) + 'px';
		} else if (typeof height === 'string') {
			style.height = height;
		};
		
		_isIE6 && that._selectFix();
		
		return that;
	},
	
	/**
	 * 跟随元素
	 * @param	{HTMLElement}
	 */
	follow: function (elem) {
		var $elem, that = this;

		if (typeof elem === 'string' || elem && elem.nodeType === 1) {
			$elem = $(elem);
		};
		if (!$elem || $elem.css('display') === 'none') {
			return that.position(that.config.left, that.config.top);
		};
		
		var winWidth = _$window.width(),
			winHeight = _$window.height(),
			docLeft =  _$document.scrollLeft(),
			docTop = _$document.scrollTop(),
			offset = $elem.offset(),
			width = $elem[0].offsetWidth,
			height = $elem[0].offsetHeight,
			left = that._fixed ? offset.left - docLeft : offset.left,
			top = that._fixed ? offset.top - docTop : offset.top,
			wrap = that.DOM.wrap[0],
			style = wrap.style,
			wrapWidth = wrap.offsetWidth,
			wrapHeight = wrap.offsetHeight,
			setLeft = left - (wrapWidth - width) / 2,
			setTop = top + height,
			dl = that._fixed ? 0 : docLeft,
			dt = that._fixed ? 0 : docTop;
		
		setLeft = setLeft < dl ? left :
		(setLeft + wrapWidth > winWidth) && (left - wrapWidth > dl)
		? left - wrapWidth + width
		: setLeft;

		setTop = (setTop + wrapHeight > winHeight + dt)
		&& (top - wrapHeight > dt)
		? top - wrapHeight
		: setTop;
		
		style.left = setLeft + 'px';
		style.top = setTop + 'px';
		
		that.config.follow = elem;
		$elem[0][_expando + 'follow'] = that.config.id;
		that._autoPositionType();
		return that;
	},
	
	/**
	 * 自定义按钮
	 * @example
				 button({
					name: 'login',
					callback: function () {},
					disabled: false,
					focus: true
				}, .., ..)
	 */
	button: function () {
		var that = this,
			ags = arguments,
			DOM = that.DOM,
			wrap = DOM.wrap,
			buttons = DOM.buttons,
			elem = buttons[0],
			strongButton = 'aui_state_highlight',
			list = $.isArray(ags[0]) ? ags[0] : [].slice.call(ags);
		
		$.each(list, function (i, val) {
			var name = val.name,
				listeners = that._listeners,
				isNewButton = !listeners[name],
				button = !isNewButton ?
					listeners[name].elem :
					document.createElement('button');
					
			if (!listeners[name]) listeners[name] = {};
			if (val.callback) listeners[name].callback = val.callback;
			if (val.className) button.className = val.className;
			if (val.focus) {
				that._focus && that._focus.removeClass(strongButton);
				that._focus = $(button).addClass(strongButton);
				that.focus();
			};
			
			button[_expando + 'callback'] = name;
			button.disabled = !!val.disabled;

			if (isNewButton) {
				button.innerHTML = name;
				listeners[name].elem = button;
				elem.appendChild(button);
			};
		});
		
		buttons[0].style.display = list.length ? '' : 'none';
		
		_isIE6 && that._selectFix();
		return that;
	},
	
	/** 显示对话框 */
	show: function (lock) {
		this.DOM.wrap.show();
		!lock && this._lockMaskWrap && this._lockMaskWrap.show();
		return this;
	},
	
	/** 隐藏对话框 */
	hide: function (lock) {
		this.DOM.wrap.hide();
		!lock && this._lockMaskWrap && this._lockMaskWrap.hide();
		return this;
	},
	
	/** 关闭对话框 */
	close: function () {
		var that = this,
			DOM = that.DOM,
			wrap = DOM.wrap,
			list = artDialog.list,
			fn = that.config.closeFn,
			follow = that.config.follow;
		
		if (that._isClose) return that;
		that.time();
		if (typeof fn === 'function' && fn.call(that, window) === false) {
			return that;
		};
		
		that.unlock();
		wrap[0].className = wrap[0].style.cssText = '';
		
		that._elemBack && that._elemBack();
		DOM.title.html('');
		DOM.content.html('');
		DOM.buttons.html('');
		
		if (artDialog.focus === that) artDialog.focus = null;
		if (follow) follow[_expando + 'follow'] = null;
		delete list[that.config.id];
		that._isClose = true;
		that._removeEvent();
		that.hide(true)._setAbsolute();
		
		_box ? wrap.remove() : _box = that;
		return that;
	},
	
	/**
	 * 定时关闭
	 * @param	{Number}	单位为秒, 无参数则停止计时器
	 */
	time: function (second) {
		var that = this,
			cancel = that.config.noText,
			timer = that._timer;
			
		timer && clearTimeout(timer);
		
		if (second) {
			that._timer = setTimeout(function(){
				that._trigger(cancel);
			}, 1000 * second);
		};
		
		return that;
	},
	
	/** 给按钮附加焦点 */
	focus: function () {
		var elemFocus, content,
			that = this,
			config = that.config,
			DOM = that.DOM;
			
		elemFocus = that._focus && that._focus[0] || DOM.close[0];
		
		try {
			elemFocus && elemFocus.focus();
		} catch (e) {};
		
		return that;
	},
	
	/** 置顶z-index */
	zIndex: function () {
		var that = this,
			wrap = that.DOM.wrap,
			index = artDialog.defaults.zIndex ++,
			focusElem = artDialog.focus;
			
		wrap.css('zIndex', index);
		that._lockMask && that._lockMask.css('zIndex', index - 1);
		
		// 设置最高层的样式
		if (focusElem) focusElem.DOM.wrap.removeClass('aui_state_focus');
		artDialog.focus = that;
		wrap.addClass('aui_state_focus');
		
		return that;
	},
	
	/** 设置屏锁 */
	lock: function () {
		if (this._lock) return this;
		
		var that = this,
			index = artDialog.defaults.zIndex += 2,
			wrap = that.DOM.wrap,
			config = that.config,
			docWidth = _$document.width(),
			docHeight = _$document.height(),
			lockMaskWrap = that._lockMaskWrap || $(_$body[0].appendChild(document.createElement('div'))),
			lockMask = that._lockMask || $(lockMaskWrap[0].appendChild(document.createElement('div'))),
			domTxt = '(document).documentElement',
			sizeCss = _isMobile ? 'width:' + docWidth + 'px;height:' + docHeight
				+ 'px' : 'width:100%;height:100%',
			ie6Css = _isIE6 ?
				'position:absolute;left:expression(' + domTxt + '.scrollLeft);top:expression('
				+ domTxt + '.scrollTop);width:expression(' + domTxt
				+ '.clientWidth);height:expression(' + domTxt + '.clientHeight)'
			: '';
		
		wrap.css('zIndex', index);
		
		lockMaskWrap[0].style.cssText = sizeCss + ';position:fixed;z-index:'
			+ (index - 1) + ';top:0;left:0;overflow:hidden;' + ie6Css;
		lockMask[0].style.cssText = 'height:100%;background:' + config.background
			+ ';filter:alpha(opacity=0);opacity:0';
		
		// 让IE6锁屏遮罩能够盖住下拉控件
		if (_isIE6) lockMask.html(
			'<iframe src="about:blank" style="width:100%;height:100%;position:absolute;' +
			'top:0;left:0;z-index:-1;filter:alpha(opacity=0)"></iframe>');
			
		lockMask.stop();
		lockMask[0].ondblclick = function () { that.close() };
		if (config.duration === 0) {
			lockMask.css({opacity: config.opacity});
		} else {
			lockMask.animate({opacity: config.opacity}, config.duration);
		};
		
		that._lockMaskWrap = lockMaskWrap;
		that._lockMask = lockMask;
		
		that._lock = true;
		return that;
	},
	
	/** 解开屏锁 */
	unlock: function (onfx) {
		var that = this,
			lockMaskWrap = that._lockMaskWrap,
			lockMask = that._lockMask;
		
		if (!that._lock) return that;
		var style = lockMaskWrap[0].style;
		var un = function () {
			if (_isIE6) {
				style.removeExpression('width');
				style.removeExpression('height');
				style.removeExpression('left');
				style.removeExpression('top');
			};
			style.cssText = 'display:none';
			
			if (_box) {
				lockMaskWrap.remove();
				that._lockMaskWrap = that._lockMask = null;
			};
		};
		
		lockMask.stop()
		lockMask[0].ondblclick = null;
		if (that.config.duration === 0) {// 取消动画，快速关闭
			un();
		} else {
			lockMask.animate({opacity: 0}, that.config.duration, un);
		};
		
		that._lock = false;
		return that;
	},
	
	// 获取元素
	_getDOM: function (wrap) {
		wrap = document.createElement('div');
		wrap.style.cssText = 'position:absolute;left:0;top:0';
		wrap.innerHTML = artDialog.templates;
		document.body.appendChild(wrap);
		
		var DOM = {wrap: $(wrap)},
			els = wrap.getElementsByTagName('*'),
			elsLen = els.length;
			
		for (var i = 0; i < elsLen; i ++) {
			DOM[els[i].className.split('aui_')[1]] = $(els[i]);
		};
		
		return DOM;
	},
	
	// px与%单位转换成数值 (百分比单位按照最大值换算)
	// 其他的单位返回原值
	_toNumber: function (thisValue, maxValue) {
		if (!thisValue && thisValue !== 0 || typeof thisValue === 'number') {
			return thisValue;
		};
		
		var last = thisValue.length - 1;
		if (thisValue.lastIndexOf('px') === last) {
			thisValue = parseInt(thisValue);
		} else if (thisValue.lastIndexOf('%') === last) {
			thisValue = parseInt(maxValue * thisValue.split('%')[0] / 100);
		};
		
		return thisValue;
	},
	
	// 让IE6 CSS支持PNG背景
	_pngFix: function () {
		var i = 0, elem, png, pngPath, runtimeStyle,
			path = artDialog.defaults.path + '/skins/',
			list = this.DOM.wrap[0].getElementsByTagName('*');
		
		for (; i < list.length; i ++) {
			elem = list[i];
			png = elem.currentStyle['png'];
			if (png) {
				pngPath = path + png;
				runtimeStyle = elem.runtimeStyle;
				runtimeStyle.backgroundImage = 'none';
				runtimeStyle.filter = "progid:DXImageTransform.Microsoft." +
					"AlphaImageLoader(src='" + pngPath + "',sizingMethod='crop')";
			};
		};
	},
	
	// 强制覆盖IE6下拉控件
	_selectFix: function () {
		var elem = this.DOM.wrap[0],
			expando = _expando + 'iframeMask',
			iframe = elem[expando],
			width = elem.offsetWidth,
			height = elem.offsetHeight,
			left = - (width - elem.clientWidth) / 2 + 'px',
			top = - (height - elem.clientHeight) / 2 + 'px';

		width = width + 'px';
		height = height + 'px';
		
		if (iframe) {
			iframe.style.width = width;
			iframe.style.height = height;
		} else {
			iframe = elem.appendChild(document.createElement('iframe'));
			elem[expando] = iframe;
			iframe.src = 'about:blank';
			iframe.style.cssText = 'position:absolute;z-index:-1;left:'
				+ left + ';top:' + top
				+ ';width:' + width + ';height:' + height
				+ ';filter:alpha(opacity=0)';
		};
	},
	
	// 解析HTML片段中自定义类型脚本，其this指向artDialog内部
	// <script type="text/dialog">/* [code] */</script>
	_runScript: function (elem) {
		var fun, i = 0, n = 0,
			tags = elem.getElementsByTagName('script'),
			length = tags.length,
			script = [];
			
		for (; i < length; i ++) {
			if (tags[i].type === 'text/dialog') {
				script[n] = tags[i].innerHTML;
				n ++;
			};
		};
		
		if (script.length) {
			script = script.join('');
			fun = new Function(script);
			fun.call(this);
		};
	},
	
	// 自动切换定位类型
	_autoPositionType: function () {
		var that = this;
		that[that.config.fixed ? '_setFixed' : '_setAbsolute']();
	},
	
	
	// 设置静止定位
	// IE6 Fixed @see: http://www.planeart.cn/?p=877
	_setFixed: (function () {
		_isIE6 && $(function () {
			var bg = 'backgroundAttachment';
			if (_$html.css(bg) !== 'fixed' && _$body.css(bg) !== 'fixed') {
				_$html.css({
					backgroundImage: 'url(about:blank)',
					backgroundAttachment: 'fixed'
				});
			};
		});
		
		return function () {
			var $elem = this.DOM.wrap,
				style = $elem[0].style;
			
			if (_isIE6) {
				var left = parseInt($elem.css('left')),
					top = parseInt($elem.css('top')),
					sLeft = _$document.scrollLeft(),
					sTop = _$document.scrollTop(),
					txt = '(document.documentElement)';
				
				this._setAbsolute();
				style.setExpression('left', 'eval(' + txt + '.scrollLeft + '
					+ (left - sLeft) + ') + "px"');
				style.setExpression('top', 'eval(' + txt + '.scrollTop + '
					+ (top - sTop) + ') + "px"');
			} else {
				style.position = 'fixed';
			};
		};
	}()),
	
	// 设置绝对定位
	_setAbsolute: function () {
		var style = this.DOM.wrap[0].style;
			
		if (_isIE6) {
			style.removeExpression('left');
			style.removeExpression('top');
		};

		style.position = 'absolute';
	},
	
	// 按钮事件触发
	_trigger: function (id) {
		var that = this,
			fn = that._listeners[id] && that._listeners[id].callback;
		return typeof fn !== 'function' || fn.call(that, window) !== false ?
			that.close() : that;
	},
	
	// 事件代理
	_addEvent: function () {
		var winResize, resizeTimer,
			that = this,
			config = that.config,
			DOM = that.DOM,
			winSize = _$window.width() * _$window.height();
			
		that._click = function (event) {
			var target = event.target, callbackID;
			
			if (target.disabled) return false; // IE BUG
			
			if (target === DOM.close[0]) {
				that._trigger(config.noText);
				return false;
			} else {
				callbackID = target[_expando + 'callback'];
				callbackID && that._trigger(callbackID);
			};
		};
		
		that._eventDown = function () {
			that.zIndex();
		};
		
		winResize = function () {
			var newSize,
				oldSize = winSize,
				elem = config.follow,
				width = config.width,
				height = config.height,
				left = config.left,
				top = config.top;
			
			if ('all' in document) {
				// IE6~7 window.onresize bug
				newSize = _$window.width() * _$window.height();
				winSize = newSize;
				if (oldSize === newSize) return;
			};
			
			if (width || height) that.size(width, height);
			
			if (elem) {
				that.follow(elem);
			} else if (left || top) {
				that.position(left, top);
			};
		};
		
		that._winResize = function () {
			resizeTimer && clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function () {
				winResize();
			}, 40);
		};
		
		// 监听点击
		DOM.wrap.bind('click', that._click)
		.bind(_eventDown, that._eventDown);
		
		// 窗口调节事件
		_$window.bind('resize', that._winResize);
	},
	
	// 卸载事件代理
	_removeEvent: function () {
		var that = this,
			DOM = that.DOM;
		
		DOM.wrap.unbind('click', that._click)
		.unbind(_eventDown, that._eventDown);
		_$window.unbind('resize', that._winResize);
	}
	
};

artDialog.fn._init.prototype = artDialog.fn;
$.fn.dialog = $.fn.artDialog = function () {
	var config = arguments;
	this[this.live ? 'live' : 'bind']('click', function () {
		artDialog.apply(this, config);
		return false;
	});
	return this;
};



/** 最顶层的对话框API */
artDialog.focus = null;



/** 对话框列表 */
artDialog.list = {};



// 全局快捷键
_$document.bind('keydown', function (event) {
	var target = event.target,
		nodeName = target.nodeName,
		rinput = /^INPUT|TEXTAREA$/,
		api = artDialog.focus,
		keyCode = event.keyCode;

	if (!api || !api.config.esc || rinput.test(nodeName)) return;
		
	keyCode === 27 && api._trigger(api.config.noText);
});



// 获取artDialog路径
_path = window['_artDialog_path'] || (function (script, i, me) {
	for (i in script) {
		// 如果通过第三方脚本加载器加载本文件，请保证文件名含有"artDialog"字符
		if (script[i].src && script[i].src.indexOf('artDialog') !== -1) me = script[i];
	};
	
	_thisScript = me || script[script.length - 1];
	me = _thisScript.src.replace(/\\/g, '/');
	return me.lastIndexOf('/') < 0 ? '.' : me.substring(0, me.lastIndexOf('/'));
}(document.getElementsByTagName('script')));




// 无阻塞载入CSS (如"artDialog.js?skin=aero")
_skin = _thisScript.src.split('skin=')[1];
if (_skin) {
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = _path + '/skins/' + _skin + '.css?' + artDialog.fn.version;
	_thisScript.parentNode.insertBefore(link, _thisScript);
};



// 触发浏览器预先缓存背景图片
_$window.bind('load', function () {
	setTimeout(function () {
		if (_count) return;
		artDialog({time: 9,left: '-9999em',fixed: false,lock: false,focus: false});
	}, 150);
});



// 开启IE6 CSS背景图片缓存
try {
	document.execCommand('BackgroundImageCache', false, true);
} catch (e) {};



/** 模板 */
artDialog.templates = [
'<div class="aui_outer">',
	'<table class="aui_border">',
		'<tbody>',
			'<tr>',
				'<td class="aui_nw"></td>',
				'<td class="aui_n"></td>',
				'<td class="aui_ne"></td>',
			'</tr>',
			'<tr>',
				'<td class="aui_w"></td>',
				'<td class="aui_center">',
					'<table class="aui_inner">',
						'<tbody>',
							'<tr style="display:none;">',
								'<td colspan="2" class="aui_header">',
									'<div class="aui_titleBar">',
										'<div class="aui_title"></div>',
										'<a class="aui_close" href="javascript:void(0);">',
											'\xd7',
										'</a>',
									'</div>',
								'</td>',
							'</tr>',
							'<tr>',
								'<td class="aui_icon">',
									'<div class="aui_iconBg"></div>',
								'</td>',
								'<td class="aui_main">',
									'<div class="aui_content"></div>',
								'</td>',
							'</tr>',
							'<tr style="display:none;">',
								'<td colspan="2" class="aui_footer">',
									'<div class="aui_buttons"></div>',
								'</td>',
							'</tr>',
						'</tbody>',
					'</table>',
				'</td>',
				'<td class="aui_e"></td>',
			'</tr>',
			'<tr>',
				'<td class="aui_sw"></td>',
				'<td class="aui_s"></td>',
				'<td class="aui_se"></td>',
			'</tr>',
		'</tbody>',
	'</table>',
'</div>'
].join('');



/**
 * 默认配置
 */
artDialog.defaults = {
								// 消息内容
	content: '<div class="aui_loading"><span>loading..</span></div>',
	title: '\u6d88\u606f',		// 标题. 默认'消息'
	button: null,				// 自定义按钮
	yesFn: null,				// 确定按钮回调函数
	noFn: null,					// 取消按钮回调函数
	yesText: '\u786E\u5B9A',	// 确定按钮文本. 默认'确定'
	noText: '\u53D6\u6D88',		// 取消按钮文本. 默认'取消'
	width: 'auto',				// 内容宽度
	height: 'auto',				// 内容高度
	minWidth: 96,				// 最小宽度限制
	minHeight: 32,				// 最小高度限制
	padding: '20px 25px',		// 内容与边界填充距离
	skin: '',					// 皮肤名(多皮肤共存预留接口)
	icon: null,					// 消息图标名称
	initFn: null,				// 对话框初始化后执行的函数
	closeFn: null,				// 对话框关闭执行的函数
	time: null,					// 自动关闭时间
	esc: true,					// 是否支持Esc键关闭
	focus: true,				// 是否支持对话框按钮聚焦
	show: true,					// 初始化后是否显示对话框
	follow: null,				// 跟随某元素
	path: _path,				// artDialog路径
	lock: false,				// 是否锁屏
	background: '#000',			// 遮罩颜色
	opacity: .7,				// 遮罩透明度
	duration: 300,				// 遮罩透明度渐变动画速度
	fixed: false,				// 是否静止定位
	left: '50%',				// X轴坐标
	top: 'goldenRatio',			// Y轴坐标
	zIndex: 1987				// 对话框叠加高度值(重要：此值不能超过浏览器最大限制)
};

window.artDialog = $.dialog = $.artDialog = artDialog;
}((window.jQuery && (window.art = jQuery)) || window.art, this));



/*
 * MOKO 弹出层接口，对artDialog 进行的封装
 *
 * 
 * 使用说明：
 * 
 * 1.Ajax 请求一个页面:
 * 
 * $(document).ready(function(){
 *		//Ajax 请求一个页面
 * 		jQuery1.mokoDialog({url:'/jsps/project/ProjectAddAlertView.jsp'});
 * 	}
 *
 * 2.Ajax请求回调函数
 *
 * $(document).ready(function(){
 *		//指定宽度width ，回调函数initFn
 * 		jQuery1.mokoDialog({url:urlString,width:1090,initFn:function(){
 *			alert('OK');
 *		}});
 * 	}
 *
 * 3.Ajax请求带有参数
 *
 * var param = jQuery1.param({'username':'mokoman'});
 * jQuery1.mokoDialog({url:'/jsps/face/FaceShowModPoPList.jsp?'+param});
 * 或者 (新增方法)
 * jQuery1.mokoDialog({url:'/jsps/face/FaceShowModPoPList.jsp',param:{'username':'mokoman'}});
 *
 *
 * 4.定时关闭弹出层并禁止Esc 关闭弹出层
 *
 * jQuery1.mokoDialog({url:'/jsps/item/ItemMusicSetOkAlert.jsp',time:2,esc:false});
 *
 * 5.关闭弹出层
 *
 * jQuery1.mokoDialog.close();
 * <a onclick="jQuery1.mokoDialog.close();">关闭</a>
 * 或者
 * <a class="moko-Dialog-close">关闭</a>
 *
 * 6.html内容弹出层
 *
 * jQuery1.mokoDialog({content:'<p>html内容弹出层</p><button class="moko-Dialog-close">x</button>,time:2});
 *
 * 7.弹出多个层需要指定id
 *
 * jQuery1.mokoDialog({url:'/jsps/item/ItemMusicSetOkAlert.jsp',id:'newDialog'});
 * 关闭时也需要指定id
 * <a onclick="jQuery1.mokoDialog.close('newDialog');">关闭</a>
 *
 * 8.指定弹出层位置 left、top
 *
 * jQuery1.mokoDialog({url:'/jsps/item/ItemMusicSetOkAlert.jsp',left:30,top:30});
 */
(function($) {
    $(function() {
        $('.moko-Dialog-close').live('click',function() {
            _close();
        });
    });
    var settings = {};
    $.mokoDialog = function(options) {
        settings = $.extend({
            title: false,
            border: false,
            lock: true,
            fixed: true,
            id: 'mokoDialog',
			noFn : false,
			padding : '0',
			background : '#000',
			opacity: .1,
			param:{}
        },options);
        if (settings.url != undefined) {
            _load();
        } else {
            _html();
        }
        return this;
    };
	//Ajax 请求数据显示
    var _load = function() {		
		$.get(settings.url,settings.param,function(data) {
			settings.content = data;
			_html();
		});
    },
	//显示html
    _html = function() {
        $.dialog(settings);
    },
	//关闭弹出层
    _close = $.mokoDialog.close = function(dialogId) {
        if (dialogId == undefined) 
			dialogId = 'mokoDialog';
		if($.dialog({id:dialogId}) != undefined)
			$.dialog({id:dialogId}).close();
    };
})(jQuery1);




/* 
 * 文本框自动撑开
 * 调用方式
 * jQuery1("#replyComments").autoResize();
 *
 * jQuery autoResize (textarea auto-resizer)
 * @copyright James Padolsey http://james.padolsey.com
 * @version 1.04
 * @修改过 [clone.width(textarea.width()-2);] 当文本框没有设置宽度的时候会出现问题，所以修改此处
 */

(function($){
    $.fn.autoResize = function(options) {
        var settings = $.extend({
            onResize : function(){},
            animate : true,
            animateDuration : 150,
            animateCallback : function(){},
            extraSpace : 0,
            limit: 150
        }, options);

        this.filter('textarea').each(function(){
            // Get rid of scrollbars and disable WebKit resizing:
            var textarea = $(this).css({resize:'none','overflow-y':'hidden'}),
                // Cache original height, for use later:
                origHeight = textarea.height(),
                // Need clone of textarea, hidden off screen:
                clone = (function(){
                    // Properties which may effect space taken up by chracters:
                    var props = ['height','width','lineHeight','textDecoration','letterSpacing'],
                        propOb = {};
                    // Create object of styles to apply:
                    $.each(props, function(i, prop){
                        propOb[prop] = textarea.css(prop);
                    });
                    // Clone the actual textarea removing unique properties
                    // and insert before original textarea:
                    return textarea.clone().removeAttr('id').removeAttr('name').css({
                        position: 'absolute',
                        top: 0,
                        left: -9999
                    }).css(propOb).attr('tabIndex','-1').insertBefore(textarea);
                })(),
                lastScrollTop = null,
                updateSize = function(event) {
					var keyCode = event.keyCode;
					if(keyCode==38||keyCode==40||keyCode==9||event.ctrlKey)
						return;
                    // Prepare the clone:
                    clone.height(0).val($(this).val()).scrollTop(10000);
                    clone.width(textarea.width()-2);
                    // Find the height of text:
                    var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace,
                        toChange = $(this).add(clone);
                    // Don't do anything if scrollTip hasen't changed:
                    if (lastScrollTop === scrollTop) { return; }
                    lastScrollTop = scrollTop;
                    // Check for limit:
                    if ( scrollTop >= settings.limit ) {
                        $(this).css('overflow-y','');
                        return;
                    }
                    // Fire off callback:
                    settings.onResize.call(this);
                    // Either animate or directly apply height:
                    settings.animate && textarea.css('display') === 'block' ?
                        toChange.stop().animate({height:scrollTop}, settings.animateDuration, settings.animateCallback)
                        : toChange.height(scrollTop);
                };
            // Bind namespaced handlers to appropriate events:
            textarea
                .unbind('.dynSiz')
                .bind('keyup.dynSiz', updateSize)
                .bind('keydown.dynSiz', updateSize)
                .bind('change.dynSiz', updateSize);
        });
        return this;
    };
})(jQuery);


/*
 * jQuery characterLimit (textarea 字符限制)
 *
 * 调用方式
 * 1.显示超出字数为负数，numTarget 为显示字数的元素
 * jQuery1('#blogContent').characterLimit({numTarget:'#textlefts'});
 *
 * 2.截取超出字符 不显示字数
 * jQuery1("textarea[id$=replyComments]").characterLimit({substring:true});
 * 
 * @引用(common.js) 中的$.stringUtil.getContentLength(str);和 $.stringUtil.byteLength(str);方法计算字数
 */
(function($) {
	
	//默认 计算短链接、超出文本不截取（微博、评论、短信 的字符限制规则）
    $.fn.characterLimit = function(options) {
        var settings = $.extend({
			maxlength : 140,
			numTarget : '',
			substring : false,
			allowShortURL : true
		}, options);
		
		this.bind("keyup cut paste focus blur textchange",function(event) {
			if (event != null && event != undefined) {
                var keyCode = event.keyCode;
                if (keyCode == 38 || keyCode == 40 || keyCode == 39 || keyCode == 37 || keyCode == 9) 
					return ;
            }
			var _this = this;
			setTimeout(function(){
				var maxNum = settings.maxlength;
				//截取都不计算短链接
				if (settings.substring && $.stringUtil.getContentLength(_this.value) > maxNum) {
					_this.value = _substring(_this.value, maxNum);
				}					
				if (settings.numTarget) {
					var currNum = $.stringUtil.getContentLength(_this.value, settings.allowShortURL);
					$(settings.numTarget).html(maxNum - currNum);
				} 
			}, 2);
			//触发自定义事件（绑定插件时就触发一次，针对文本框一开始就有内容）
		}).trigger("textchange");
        
        var _substring = function(str, maxLength) {
			var b = str.replace(/\*/g, " ").replace(/[^\x00-\xff]/g, "**");
			str = str.slice(0, b.slice(0, maxLength * 2).replace(/\*\*/g, " ").replace(/\*/g, "").length);
			if ($.stringUtil.byteLength(str) > maxLength * 2) {
				str = str.slice(0, str.length - 1)
			}
			return str;
		};
		
		return this;
    }
    
    //默认 不计算短链接、超出文本截取
	$.fn.characterLimit2 = function(options) {
		var param = {
			maxlength : 140,
			numTarget : '',
			substring : true,
			allowShortURL : false
		};
		$.extend(param, options);
		this.characterLimit(param);
	}
    
})(jQuery);


/*
 * 拼音搜索关注人
 * 
 * 需要引人 pinyinSearch.css
 * <link href="pinyinSearch.css" rel="stylesheet" type="text/css" />
 *
 * 调用方式
 * 1. 文本框绑定插件，将type和回调函数传入即可
 * $('.edit').pinyinSearch({type:1,clickCallback:function(id,name,wkey){
 *		alert('id:'+id + ',name:'+name +',wkey:'+wkey);
 * }});
 * 
 * 2. 在文本框自定义属性传入 type值
 * HTML:
 * <input type="text" name="edit" size="70" class="edit" pinyinType="1" />
 * JS:
 * $('.edit').pinyinSearch({clickCallback:function(id,name,wkey){
 *		alert('id:'+id + ',name:'+name +',wkey:'+wkey);
 * }});
 *
 */

(function($){
	$.fn.pinyinSearch=function(options){
		//合并两个或更多的对象的内容
		var settings = $.extend({
            url:'/searchUser|findUserByPinYin.action',
			type:0,
			data:{},
			clickCallback:function(id,name,wkey){}
        }, options);
		var $userList = null,jsonList = {};
		var _init = function(){
			$userList = $('#moko-pinyinSearch-list');
			if($userList[0] == undefined){
				$userList = $('<ul>',{'id':'moko-pinyinSearch-list'}).appendTo(document.body);
			}
			$(document).bind('click',function(){
				$userList.hide();
			});
		}();
		var _getList = function(obj){
			var name = obj.value;
			if(name == '')
				return ;
			var param = {
				findfriendname : name,
				type : settings.type
			};
			$.extend(param, settings.data);
			$.ajax({
				url:settings.url,
				type:"post",
				dataType:"json",
				data:param,
				success:function(data){
					if(data == null || data.friendList == undefined){
						$userList.empty().hide();
						return ;
					}					
					$userList.empty().show();
					jsonList = data.friendList;
					$.each(jsonList,function(i,user){
						$('<li>').append($('<a href="javascript:void(0)" />').html(user.name)).appendTo($userList).bind('click',function(){
							obj.value = "";
							settings.clickCallback.call(obj,user.id,user.name,user.wkey);
							$userList.focus().hide();
						});
					});
					$('#moko-pinyinSearch-list li a:first').addClass("active");
				}
			});
		}
		this.each(function(){
			$(this).bind({
				'keyup':function(event){
					var $this = $(this);
					//读取自定义属性pinyinType
					var pinyinType = $this.attr('pinyinType');
					if(pinyinType != undefined)
						settings.type = pinyinType;
					//计算ul列表的宽度及位置
					$userList.width($this.outerWidth() - parseInt($userList.css('padding-left')) - parseInt($userList.css('padding-right')) -2);
					$userList.css({'left':$this.offset().left,'top':$this.offset().top + $this.outerHeight()});
					var keyCode = event.keyCode;
					if(keyCode != 40 && keyCode != 38 && keyCode != 13)
						_getList(this);
				},
				'keydown':function(event){
					var keyCode = event.keyCode;
					var $li = null;
					var $a = $('#moko-pinyinSearch-list a[class="active"]');
					if(keyCode==40){//当弹出列表时 按下箭头
						$li = $a.toggleClass("active").parent('li').next();
						if($li[0] == undefined)
							$li = $a.parents('ul').children('li:first');
						$li.children('a').toggleClass("active");
						return false;
					}
					else if(keyCode == 38){ //当弹出列表时 按上箭头
						$li = $a.toggleClass("active").parent('li').prev();
						if($li[0] == undefined)
							$li = $a.parents('ul').children('li:last');
						$li.children('a').toggleClass("active");
						return false;
					}
					else if(keyCode == 13 || keyCode==9){ //回车 或者 TAB 时
						this.value = "";
						if(jsonList.length == undefined || jsonList.length <= 0)
							return ;
						var user = jsonList[$a.parent('li').index()]; //找到当前li的下标
						settings.clickCallback.call(this,user.id,user.name,user.wkey);
						$userList.hide();
						return false;
					}
				}
			});
		});
		return this;
	};
})(jQuery1);

/*
 * 好友选择器
 * 
 * 需要引人 pinyinSearch.css 、pinyinSearch.js 、gift-plug.css
 * <link href="pinyinSearch.css" rel="stylesheet" type="text/css" />
 * <link href="gift-plug.css" rel="stylesheet" type="text/css" />
 * <script type="text/javascript" src="pinyinSearch.js"></script>
 * 
 *
 * 调用方式
 * 1. 文本框绑定插件，指定生成多选框的 name
 * $('.edit2').gift({checkboxName:'username'});
 * 
 * 2. 文本框绑定插件，指定生成多选框的 name 以及选择好友的个数上线
 * $('.edit1').gift({checkboxName:'userId',size:2});
 * 
 * 3. 默认数据 defaultData
 * $('.edit2').gift({checkboxName:'username',defaultData:[{name:'xxx',id:'9'}]});
 * 
 * 4. 默认数据 自定义属性defaultData
 * HTML:
 * <input type="text" class="edit1" defaultData="[{name:'雷可儿Rita',id:'16450'},{name:'11',id:'99'}]" />
 * JS: 
 * $('.edit1').gift({checkboxName:'userId',size:2});
 *
 */

(function($){
	if($.mk == undefined)
		$.mk = {};
	if($.mk.gift == undefined)
		$.mk.gift = {};
	$.mk.gift.userTab = null;
	/* 
	 * 调用方式
	 * $.mk.gift.clickCallBack.call(this,id,name,event);
	 */
	$.mk.gift.clickCallBack = function(id,name,event){
		if(event != null) //ie不加判断会报错
			event.cancelBubble = true; //原生的防止事件冒泡

		var $input = $.mk.gift.userTab.data('handler');
		var settings = $.mk.gift.userTab.data('settings');
		if(!$input)
			return ;
		$searchFriend = $input.parents('div.moko-searchFriend');
		
		//判断如果已经勾选则去掉勾选
		var $temp =$searchFriend.find('input[value="'+id+'"]');
		if(!this.checked && $temp[0] != undefined){
			$temp.parent().remove();
			return ;
		}
		if($searchFriend.find('div.moko-user .moko-userLabel').size() >= settings.size){
			alert('超出最大限制：'+settings.size);
			this.checked = false;
			return ;
		}		
		var $checkbox = $('<input />',{'type':'checkbox','name':settings.checkboxName,'value':id,'checked':true}).hide();
		var $a = $('<a />',{'href':'javascript:void(0)','text':'x'}).bind('click',function(){
			$(this).parent('div').remove();
			$input.focus();
			_resetPosition();
			$.mk.gift.userTab.find('input[value="'+id+'"]').prop('checked',false);
		});
		$('<div />',{'class':'moko-userLabel'}).html(name).append($checkbox).append($a).insertBefore($searchFriend.find('.moko-user input[type="text"]'));
	
		_resetPosition();
		
	}
	
	$.fn.gift = function(options){
		//合并两个或更多的对象的内容
		var settings = $.extend({
            url:'/gift|oldNewFriendList.action',
			checkboxName:'userId',
			defaultData:[],
			size:5
        }, options);
		var init = function(){
			if($.mk.gift.userTab == null){			
				var cssText = {'position':'absolute','z-index':'10','border':'#ccc solid 1px','width':'370px','height':'170px','overflow':'auto','display':'none','background':'#fff'};
				$.mk.gift.userTab = $('<div />',{'id':'moko-giftUserTab',css:cssText}).appendTo(document.body);
			}
			$.mk.gift.userTab.html('请稍候。。。');
			$.ajax({
				url:settings.url,
				type:"post",
				data:{'index':0},
				success:function(response){	
					$.mk.gift.userTab.html(response);
				}
			});
		}();

		this.each(function(){
			var $input = $(this);			
			//初始化DOM结构
			$input.wrap('<div class="moko-searchFriend" />').wrap('<div class="moko-user" />').parent().before('<div class="moko-cursor"><div class="downCursor"></div></div>');
			$input.bind({
				//删除前一个用户标签
				'keydown':function(event){
					if(event.keyCode != 8 || this.value != '')
						return ;
					$tempDiv = $input.prev();
					var id = $tempDiv.find('input:checkbox').val();
					$tempDiv.remove();
					_resetPosition();
					setTimeout(function(){_autoCheck();},0);
				},
				'focus':function(){
					//放入对象
					$.mk.gift.userTab.data('handler',$input); 
					$.mk.gift.userTab.data('settings',settings);
				}
			});

			var $searchFriend = $input.parents('.moko-searchFriend');
			//点击让文本框获得焦点
			$searchFriend.bind('click',function(){
				$input.focus();
			});
			
			$input.parent().prev('.moko-cursor').click(function(event){
				event.stopPropagation(); //防止事件冒泡
				//放入对象
				$.mk.gift.userTab.data('handler',$input); 
				$.mk.gift.userTab.data('settings',settings);
				$.mk.gift.userTab.toggle();
				_resetPosition();//设置$.mk.gift.userTab的位置
				setTimeout(function(){_autoCheck();},0); //设置选中状态
			});
			//拼音搜索关注人
			$input.pinyinSearch({type:1,clickCallback:function(id,name){
				$input.val('').focus();
				var $searchFriend = $input.parents('.moko-searchFriend');
				//验证已选个数
				if($searchFriend.find('.moko-userLabel').size() >= settings.size){
					alert('超出最大限制：'+settings.size);
					return ;
				}
				setTimeout(function(){_autoCheck();},0); //设置选中状态
				//验证已经被勾选则return
				if($.mk.gift.userTab.find('input[value="'+id+'"]').is(':checked'))
					return ;

				_createUserLabel($input,name,id,settings.checkboxName);
				//将$.mk.gift.userTab对应的多选框设为选中状态
				$.mk.gift.userTab.find('input[value="'+id+'"]').prop('checked',true);
				_resetPosition();//设置$.mk.gift.userTab的位置
			}});
			var defaultData = [];
			if($input.attr('defaultData'))
				defaultData = eval($input.attr('defaultData'));
			else
				defaultData = settings.defaultData;
			
			//如果没有默认数据
			if(defaultData.length == 0)
				return ;
				
			$.each(defaultData,function(i,user){
				if(parseInt(user.id) <= 0 || user.name == '')
					return ;
				_createUserLabel($input,user.name,user.id,settings.checkboxName);
			});
			
		});
	};
	$(document).click(function(){
		if($.mk.gift.userTab != null)
			$.mk.gift.userTab.hide();
	});	
	//调整关注人$.mk.gift.userTab div位置
	var _resetPosition = function(){
		// 获取文本框对象
		var $input = $.mk.gift.userTab.data('handler');
		var $searchFriend = $input.parents('.moko-searchFriend');
		var offset = $searchFriend.offset();
		var position = {'left':offset.left+$searchFriend.outerWidth() - $.mk.gift.userTab.outerWidth(),'top':offset.top + $searchFriend.outerHeight() + 5};
		$.mk.gift.userTab.css(position);
	},
	//自动选中
	_autoCheck = function(){
		var $input = $.mk.gift.userTab.data('handler');
		var settings = $.mk.gift.userTab.data('settings');
		var $searchFriend = $input.parents('.moko-searchFriend');
		var $checkbox = $searchFriend.find('.moko-userLabel input:checkbox');
		$.mk.gift.userTab.find('input:checkbox').prop('checked',false);
		$checkbox.each(function(i,obj){
			$.mk.gift.userTab.find('input[value="'+obj.value+'"]').prop('checked',true);
		});
	},
	_createUserLabel = function($input,name,id,checkboxName){		
		//创建多选框
		var $checkbox = $('<input />',{'type':'checkbox','name':checkboxName,'value':id,'checked':true}).hide();
		//创建删除该用户标签的a连接，绑定事件
		var $a = $('<a />',{'href':'javascript:void(0)','text':'x'}).bind('click',function(){
			$(this).parent('div').remove();
			$input.focus();
			_resetPosition();
			$.mk.gift.userTab.find('input[value="'+id+'"]').prop('checked',false);
		});
		//创建用户标签插入多选框和a连接
		$('<div />',{'class':'moko-userLabel'}).html(name).append($checkbox).append($a).insertBefore($input);
	};
})(jQuery1);


/**
 * At 提到谁
 */
(function($){
	$.fn.atWho=function(options){
		if(this.length == 0)
			return ;
		//合并两个或更多的对象的内容
		var settings = $.extend({
            url:'/blogUpdate|findUserSubscribeAjax.action',
			status:'none',
			cursor:0
        }, options);
		var $atWhoDiv = $('#moko-atWhoDiv'),$userList = $('#moko-atWhoList'),isIE=!-[1,];
		if($atWhoDiv[0] == undefined){
			$atWhoDiv = $('<div />',{'id':'moko-atWhoDiv'}).addClass('search_1 wBC atwho').appendTo(document.body).height('auto').hide().css({'z-index':2000});
			$('<p />',{text:'想用@提到谁?'}).addClass('bd').appendTo($atWhoDiv);
			$userList = $('<ul/>',{'id':'moko-atWhoList'}).addClass('bd wBC').appendTo($atWhoDiv);
		}
		

		this.each(function(){
			$(this).bind({
				'keydown':function(event){
					if(settings.status != 'show')
						return ;						
					var $li = null,$a = $userList.find('a[class="wC mBC"]');
					var keyCode = event.keyCode;
					if(keyCode==40){//当弹出列表时 按下箭头
						$li = $a.attr("class","mwC").parent('li').next();
						if($li[0] == undefined)
							$li = $a.parents('ul').children('li:first');
						$li.children('a').attr("class","wC mBC");
						return false;
					}
					else if(keyCode == 38){ //当弹出列表时 按上箭头
						$li = $a.attr("class","mwC").parent('li').prev('li');
						if($li[0] == undefined)
							$li = $a.parents('ul').children('li:last');
						$li.children('a').attr("class","wC mBC");
						return false;
					}
					else if(keyCode == 13 || keyCode==9){ //回车 或者 TAB 时
						var textStr = this.value,cursor = _getCursor(this);
						var startStr = textStr.substring(0,cursor);
						startStr = textStr.substring(0,startStr.lastIndexOf('@'));
						var endStr = textStr.substring(cursor,textStr.length);
						this.value = startStr + '@' +$a.text() +' '+ endStr;
						_setCursor(this,settings.cursor+$a.text().length);
						$userList.find('li').remove();
						$atWhoDiv.hide();
						settings.status = 'none';
						return false;
					}
				},
				'keyup':function(event){
					var keyCode = event.keyCode;	
					if(keyCode == 38 || keyCode == 40)
						return ;
					if(this.value.lastIndexOf('@') == -1)
						return ;
					var cursor = _getCursor(this);
					if(this.value.substring(0,cursor).lastIndexOf('@') != -1){
						settings.cursor = cursor;
						_getList(this);
					}
				},
				'scroll':function(){
					var $tempDiv = $('#moko-atWhoCopyTemp');
					if($tempDiv[0] != undefined)
						$tempDiv[0].scrollTop= this.scrollTop;
				}
			});
		});
		$(document).click(function(){
			if($atWhoDiv[0] != undefined)
				$atWhoDiv.hide();
		});
		var _clickCallback = function(obj){
			$a = $(this);
			var textStr = obj.value,cursor = _getCursor(obj);
			var startStr = textStr.substring(0,cursor);
			startStr = textStr.substring(0,startStr.lastIndexOf('@'));
			var endStr = textStr.substring(cursor,textStr.length);
			obj.value = startStr + '@' +$a.text() +' '+ endStr;
			_setCursor(obj,settings.cursor + $a.text().length);
			$userList.find('li').remove();
			$atWhoDiv.hide();
			settings.status = 'none';
		},
		_getList = function(obj){
			var str = obj.value.substring(0,_getCursor(obj)).split("@");
			var findNickName = str[str.length - 1];
			if(!_checkNickNameFuHao(findNickName)){
				$userList.find('li').remove();
				$atWhoDiv.hide();
				return ;
			}
			var position = _getPosition($(obj));
			$atWhoDiv.css({left:position.left,top:position.top});
			$.ajax({
				url:settings.url,
				type:"post",
				dataType: "text",
				data:{"findNickName":findNickName},
				success:function(data){
					if(data == ""){
						$userList.find('li').remove();
						$atWhoDiv.hide();
						settings.status = 'none';
						return ;
					}									
					var group = data.split(';');
					$userList.find('li').remove();
					$.each(group,function(i,val){
						var $li = $('<li />').append($('<a class="mwC" href="javascript:void(0)" />').html(val).bind('click',function(){_clickCallback.call(this,obj)})).appendTo($userList);
						
						$li.bind('mouseover',function(){
								$userList.find('li a').not(this).attr('class','mwC');
								$(this).children('a').attr("class","wC mBC");
							});
					});				
					$userList.find('li a:first').attr("class","wC mBC");
					$atWhoDiv.show();
					settings.status = 'show';
				}
			});
		},
		_getPosition = function($obj){		
			var position = $obj.offset();
			var cursor = _getCursor($obj[0]);
			var textStr = $obj.val();
			var startStr = textStr.substring(0,cursor);
			var width = $obj.width(),height = $obj.height(),left = position.left,top = position.top,bottom = top + height,right = left +width;
			var atCursor = startStr.lastIndexOf('@');
			startStr= startStr.substring(0,atCursor);
			var endStr = textStr.substring(atCursor+1,textStr.length);
			//创建div
			var $tempDiv = $('#moko-atWhoCopyTemp');
			if($tempDiv[0] == undefined){
				var cssText = {
					'width':width,
					'height':height,
					'white-space':'pre-wrap',
					'word-wrap': 'break-word',
					'border': '#000 solid 1px;',
					'position': 'absolute',
					'z-index':'-10000',
					'visibility':'hidden',
					'overflow':'auto',
					'font-family':$obj.css('font-family'),
					'font-size':$obj.css('font-size')
				};
				$tempDiv = $('<div />',{'id':'moko-atWhoCopyTemp'}).appendTo(document.body).css(cssText);
			}
			//将转换后的代码写入div,再设置其位置
			$tempDiv.text(startStr).html($tempDiv.html()+ '<em class="moko-atIndex">@</em>' + endStr).css({'left':left,'top':top} );
			if(isIE){ //如果是ie
				startStr = jQuery1.replaceAll(startStr, "<", "#");
				startStr = jQuery1.replaceAll(startStr, " ", "&nbsp;");
				startStr = jQuery1.replaceAll(startStr, "\n", "<br>");
				//将转换后的代码写入div,再设置其位置
				$tempDiv.html(startStr + '<em class="moko-atIndex">@</em>' + endStr).css({'left':left,'top':top,'overflow-y':'scroll'});
			}
			//获得at 的位置等信息
			var $at = $tempDiv.find('.moko-atIndex');
			var atPosition = $at.offset(),atLeft =atPosition.left,atHeight=$at.height(),atTop = atPosition.top+atHeight+2;
			if(atTop > bottom)
				atTop = bottom;
			if(atLeft > right)
				atLeft = right;			
			return {'left':atLeft,'top':atTop};
		},
		_getCursor = function(m){
			var j = 0;b = document.selection;
			if (isIE) { //IE
				m.focus();
				var g = null;
				g = b.createRange();
				var h = g.duplicate();
				h.moveToElementText(m);
				h.setEndPoint("EndToEnd", g);
				m.selectionStart = h.text.length - g.text.length;
				m.selectionEnd = m.selectionStart + g.text.length;
				j = m.selectionStart;
			} else {
				if (m.selectionStart || m.selectionStart == "0") {
					j = m.selectionStart;
				}
			}
			return j;
		},
		//设置焦点位置
		_setCursor = function(j,m) {
			m = m == null ? j.value.length: m;
			j.focus();
			if (j.createTextRange) {
				var range = j.createTextRange();
				range.move("character", m);
				range.select();
			} else {
				j.setSelectionRange(m, m);
			}
		},
		_checkNickNameFuHao = function(nickName){
			return /^[-_a-zA-Z0-9\u4e00-\u9fa5]+$/.test(nickName);
		};
		
	}
})(jQuery);

/*
 * 文本框水印文字
 * 调用方式
 * 自定义属性 placeholder 在html5中已经使用
 * HTML:
 * <input type="text" class="demo" placeholder="请输入。。。">
 * JS:
 * $('.demo').autoText();
 */
(function($){
	$.fn.autoText = function(options){
		//浏览器是否支持placeholder 属性
		if('placeholder' in document.createElement('input'))
			return this;
		
		//循环jquery选择器的多个对象
		this.each(function(){
			//每一个文本框对象
			var $this = $(this);
			var settings = {color:'#ccc'};
			
			//获取文本颜色
			var color = $this.css('color');
			
			if(options)
				settings.text = options.text;
			if($this.attr('placeholder'))
				settings.text = $this.attr('placeholder');
				
			//如果文本框没有文字则赋默认文字
			if($this.val() == '')
				$this.val(settings.text).css('color',settings.color);
			
			//绑定事件
			$this.bind({
				'focus.autoText':function(){
					$this.css('color',color);
					if($this.val() == settings.text)
						$this.val('');
				},
				'blur.autoText':function(){
					if($this.val() == '')
						$this.val(settings.text).css('color',settings.color);
				}
			});
		});
		return this;
	};
})(jQuery);
	
/* 
 * 漂浮消息提醒
 *
 * 调用方式：
 * jQuery1('#msgMore').smartFloat("headerNickName");
 */
(function($){
	$.fn.smartFloat = function(targetId) {
		var $owner = this;
		var ownerTop = parseInt($owner.css('top'));
		_get_left = function(){
			var $target = $("#"+targetId);
			return $.getElementPos($target[0]).x + parseInt($target.css("padding-left"));
		}
		$owner.css({ "left" : _get_left });
		if ($.isIE6) {
			_get_top = function() {
				var scrollTop = document.documentElement.scrollTop; 
				return scrollTop > ownerTop ? scrollTop : ownerTop;
			}
			$owner.get(0).style.setExpression('top', 'eval(_get_top())+"px"');
			$owner.get(0).style.setExpression('left', 'eval(_get_left())+"px"');
		} else {
			$(window).bind("scroll.smartFloat", function() {
				var scrollTop = $(this).scrollTop();
				if(scrollTop > ownerTop)
					$owner.css({ "position" : "fixed", "top" : 0 });
				else
					$owner.css({ "position" : "fixed", "top" : ownerTop });
			});
			$(window).bind("resize.smartFloat", function() {
				$owner.css({ "left" : _get_left });
			});	
		}
	};
})(jQuery1);

/**
 * moko日历调用：
 * 
 * jQuery1("#brithday").calendar({
 * 		//最小年（可选）
 * 		minYear: 1990,
 * 		//最大年（可选）
 * 		maxYear: now.getFullYear(),
 * 		//初始显示的日期（可选，默认当前时间）
 * 		defaultDate : 2008-11-30,
 * 		//选择了日期后的 回调函数（可选）
 * 		callback : null 
 * });
 * 
 */
(function($){
	$.fn.Calendar = $.fn.calendar = function(o) {
	    var $owner = $(this);
	    var now = new Date();
	    var p = {
	        minYear: 1990,
	        maxYear: now.getFullYear(),
	        defaultDate : now,
	        callback : null
	    }
	    $.extend(p, o);
	    
	    // 默认时间参数处理
		$owner.each(function() {
			var _defaultDate = $owner.attr("defaultDate");
			if (_defaultDate) {
			    var date_info = _defaultDate.split(" ")[0].split("-");
			    p.defaultDate = new Date(Number(date_info[0]), Number(date_info[1]) - 1, Number(date_info[2]));
		    }
			if ($(this).attr("defaultDate") !== 'undefined') {
				fillValue($(this), p.defaultDate.getFullYear(), p.defaultDate.getMonth() + 1, p.defaultDate.getDate());
			}
		});
		
    	// 第一次点击初始 控件
	    $owner.click(function(event){
	    	event.stopPropagation();
	    	$currentOwner = $(this);
	    	if (!init_flag)
	    		$calendar = new $.calendar(p);
	    		
	    	$calendar.show();
	    	resetView($calendar, $(this));
	    });
	}
	
	// 设置日历显示的位置
	function resetView(datepicker, owner){
    	var os = owner.offset();
    	datepicker.css({
			"top" : (os.top + owner.height() + 14),
			"left" : os.left
		});
	}
	
	// 填充日期
	function fillValue(elem, year, month, day) {
		if (month < 10)
			month = "0" + month;
		if (day < 10)
			day = "0" + day;
		elem.val(year + "-" + month + "-" + day);
	}
	
	// 加载标识 保证只存在一个对象
	var $calendar,
	// 当前调用的日历的元素
	$currentOwner;
	var init_flag = false;
	
	$.calendar = function (p) {
		init_flag = true;
	    var $datepicker, $year, $year_option, $month, $month_option;
    	// 加入样式
    	$('<style type="text/css">\
			<!--\
			html{-webkit-text-size-adjust:none;}\
			.moko-datepicker { font-size:12px; width:170px; border:#bbb solid 1px; padding:3px; position:absolute; background:#fff; z-index:9999; }\
			.moko-datepicker a{ text-decoration:none; color:#000;}\
			.moko-datepicker .input{ width:30px; height:15px;}\
			.moko-datepicker .weekday{ border-collapse:collapse; border:#ccc solid 1px;}\
			.moko-datepicker .weekday thead{ background:#eaeaea;}\
			.moko-datepicker td{ width:20px; height:20px; vertical-align:middle; text-align:center; }\
			.moko-datepicker .weekend{ color:#F09;}\
			.moko-datepicker .disable{ color:#eaeaea;}\
			\
			.moko-datepicker .block{ display:block;}\
			.moko-datepicker tbody td{cursor:pointer;}\
			.moko-datepicker tbody td:hover,.moko-datepicker tbody td.today{ background:#f09; color:#FFF;}\
			.moko-datepicker .ctrl{ overflow:hidden; margin-bottom:5px;}\
			.moko-datepicker .ctrl ul{ margin:0px; padding:0px; list-style:none; position:absolute; display:block; background:#fff; border:#ccc solid 1px; text-align:center; display:none; }\
			.moko-datepicker .ctrl ul li{ padding:2px 5px; cursor:pointer;}\
			.moko-datepicker .ctrl ul li:hover{ background:#eaeaea;}\
			.moko-datepicker .ctrl .next ul{ right:3px; width:65px;}\
			.moko-datepicker .ctrl .center{ text-align:center; width:100%; margin:0px; padding:0px; font-size:12px;}\
			.moko-datepicker .ctrl .today{ text-align:center;  display:block; cursor:pointer; margin:0px 65px;}\
			.moko-datepicker .ctrl .center{ text-align:center; width:65px; margin:0px; padding:0px; font-size:12px;}\
			.moko-datepicker .prev,.moko-datepicker .next{width:65px;  display:block; cursor:pointer;}\
			.moko-datepicker .prev{ float:left; text-align:left;}\
			.moko-datepicker .next{ float:right; text-align:right;}\
			-->\
		</style>').appendTo(document.body);
    	
    	
        // 日期表格
        var year = p.defaultDate.getFullYear(), month = p.defaultDate.getMonth() + 1;
        weekday = '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="weekday" align="center">';
        weekday += "<thead><tr><td>日</td><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td></tr></thead>";
        // 天数 6行7列空表格
        weekday += "<tbody>";
        for (var y = 0; y < 6; y++) {
            weekday += '<tr>\
				<td class="weekend"></td>\
				<td></td><td></td><td></td><td></td><td></td>\
				<td class="weekend"></td>\
			 </tr>';
        }
        weekday += "</tbody></table>";
        // 时间控件
        $datepicker = $('<div class="moko-datepicker">\
		       <div class="ctrl">\
			       <span class="prev">\
	                   <span class="block"></span>\
					   <ul><h2 class="center"></h2></ul>\
				   </span>\
				   <span class="next">\
				       <span class="block"></span>\
					   <ul></ul>\
				   </span>\
				   <span class="today">今天</span>\
	           </div>\
		   </div>');
        $datepicker.append(weekday);

        $year = $datepicker.find(".prev > .block");
        $year_option = $datepicker.find(".prev > ul");
        $month = $datepicker.find(".next > .block");
        $month_option = $datepicker.find(".next > ul");
        $year_option.find(".center").append($('<span>←&nbsp;</span>').click(function() {
            var f_year = parseInt($year_option.find("li:first").text());
            if (f_year <= p.minYear) return;
            $year_option.find("li").remove();
            for (var i = 10; i >= 1; i--) {
                var year = f_year - i;
                if (year >= p.minYear) appendOptions(year, $year_option, $year);
            }
        })).append($('<span>x</span>').click(function() {
			$year_option.hide();
		})).append($('<span>&nbsp;→</span>').click(function() {
            var l_year = parseInt($year_option.find("li:last").text());
            if (l_year >= p.maxYear) return;
            $year_option.find("li").remove();
            for (var i = 1; i <= 10; i++) {
                var year = l_year + i;
                if (year <= p.maxYear) appendOptions(year, $year_option, $year);
            }
        }));
        // 初始年份选项
        for (var i = year - 5; i < year + 5; i++) {
            if (i >= p.minYear && i <= p.maxYear)
				appendOptions(i, $year_option, $year);
        }
        // 初始月份选项
        for (var i = 1; i <= 12; i++) {
            appendOptions(i, $month_option, $month);
        }
        // 年份选项事件
        $year.text(year).click(function() {
            $year_option.show();
            $month_option.hide();
        });
        // 月份选项事件
        $month.text(month).click(function() {
            $month_option.show();
            $year_option.hide();
        });
        // 今天事件
        $datepicker.find(".today").click(function() {
    	 	$month_option.hide();
            $year_option.hide();
            
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();
            $year.text(year);
            $month.text(month);
            fillDates(year, month);
            $datepicker.find(".weekday tbody td").each(function(){
            	if ($(this).text() == date
            			// 排除前后月的天数
						&& $(this).attr("class") != "disable")
					$(this).click();
            });
        });
        //天数上的点击事件
        $datepicker.find(".weekday tbody td").click(function() {
            var year = parseInt($year.text());
            var month = parseInt($(this).attr("month") || $month.text());
            //前后月处理
            if (month > 12) {
				year++;
				month = 1;
			} else if (month < 1) {
				year--;
				month = 12;
			}
			var day = parseInt($(this).text());
        	fillValue($currentOwner, year, month, day);
            $datepicker.hide();
            
            //选择后回调
            if (p.callback)
				p.callback();
        });

        // 添加年月的选项
        function appendOptions(tx, $target, $parent) {
            $("<li/>").click(function() {
                $parent.text($(this).text());
                fillDates();
                $target.hide();
            }).text(tx).appendTo($target);
        }

        $(document.body).append($datepicker);
		fillDates();
		
		//点击空白 隐藏日历
		var isInCalendar = false;
		$datepicker.bind("mouseout.datepicker", function(){
			isInCalendar = false;
		});
		$datepicker.bind("mouseover.datepicker", function(){
			isInCalendar = true;
		});
		$(document).bind("click.datepicker", function(){
			if (!isInCalendar) {
				$month_option.hide();
            	$year_option.hide();
				$datepicker.hide();
			}
		});
			
	    // 获取 本月及上个月的信息
	    function dateInfo (year, month) {
	        // month参数的月份为1~12
	        month = month - 1;
	        var date_1 = new Date(year, month, 1);
	        // (下月的第0天 就是)本月的最大天
	        var date_2 = new Date(year, month + 1, 0);
	        // 上个月最大天
	        var date_u = new Date(year, month, 0);
	        // 下个月最大天
	        var date_n = new Date(year, month + 2, 0);
	        return {
	            // 第一天星期几
	            fd_week: date_1.getDay(),
	            // 最后一天星期几
	            ld_week: date_2.getDay(),
	            // 这个月的总天数
	            total: date_2.getDate(),
	            // 上个月的总天数
	            up_total: date_u.getDate(),
	            // 下个月的总天数
	            ne_total: date_n.getDate()
	        };
	    }
	    // 填充天数
	    function fillDates (year, month) {
	        if (!year) year = parseInt($year.text());
	        if (!month) month = parseInt($month.text());
	        var d_info = dateInfo(year, month);
	
	        var days_table = $datepicker.find(".weekday tbody")[0];
	        // 当前月份
	        var cur_month = parseInt($month.text()),
	        // 显示天数的td对象
	        $day,
	        // 显示的天数
	        d_value,
	        // 本月的天数开始
	        cur_day = 1,
	        // 下个月的天数开始
	        nx_day = 1,
	        // 上个月的天数开始
	        up_day = d_info.up_total - d_info.fd_week + 1;
	        for (var row = 0; row < 6; row++) {
	            for (var cell = 0; cell < 7; cell++) {
	                $day = $(days_table.rows[row].cells[cell]);
	                if (row == 0 && cell < d_info.fd_week) {
	                    d_value = up_day++;
	                    $day.addClass("disable").attr("month", cur_month - 1);
	                } else if (cur_day > d_info.total) {
	                    d_value = nx_day++;
	                    $day.addClass("disable").attr("month", cur_month + 1);
	                } else {
	                    d_value = cur_day++;
	                    $day.removeClass("disable").attr("month", cur_month);
	                }
	                $day.text(d_value);
	            }
	        }
	    }
	    
	    return $datepicker;
	}

})(jQuery1);

/**
 * 用户资料浮动层
 * Exa:
 * <a href="#" class="xxx" wkey="obm" nickname="" >奥巴马</a>
 * jQuery1('.xxx').aero();
 */
(function($){
	$.fn.aero = function(){
		
		this.each(function(){
			var $this = $(this);
			var $aero,timer,flag = true,deviation = 20;

			$this.hover(function(){
				timer = setTimeout(function(){
					var wKey = $this.attr('wkey');
					var nickName = $this.attr('nickname');
					if(wKey == undefined && nickName == undefined)
						return ;
					if(wKey != undefined)
						var $aeroCache = $('#'+wKey+'_userFloatLayer');
					else if(nickName != undefined)
						var $aeroCache = $('#userFloatLayer_'+nickName);
					if($aeroCache[0] == undefined){
						if(wKey != undefined)
							params = $.param({"wKey" : wKey});
						else if(nickName != undefined)
							params = $.param({"nickName" : nickName});
						$.ajax({
							url: '/userFloatLayer.action',
							data: params,
							async:false,
							success: function(html){
								$aero = $(html).first();
								$aero.appendTo(document.body);
								if(wKey != undefined)
									$aero.attr('id',wKey+'_userFloatLayer');
								else if(nickName != undefined)
									$aero.attr('id','userFloatLayer_'+nickName);
							}
						});
					}
					else
						$aero = $aeroCache;
					$aero.hover(function(event){
						event.stopPropagation();
						flag = false;
					},
					function(event){
						event.stopPropagation();
						$aero.fadeOut(80);
						flag = true;
					});
					var left = $this.offset().left;
					var top = $this.offset().top - $aero.outerHeight();
					var $window = $(window);
					if(left + $aero.outerWidth() > $window.width() + $window.scrollLeft())
						left -= $aero.outerWidth();
					if(top < $window.scrollTop())
						top += ($aero.outerHeight() + deviation);
					$aero.css({'left':left,'top':top}).fadeIn('slow');
				},200);
			},
			function(){
				clearTimeout(timer);
				setTimeout(function(){
					if(flag && $aero != undefined)
						$aero.fadeOut(80);
				},200);
			});			   
		});
		return this;
	};
})(jQuery1);

//元素获取焦点提示效果(包含图片)
(function($) {
	if (typeof document.attachEvent != 'undefined') {
	    window.attachEvent('onload', init);
	    document.attachEvent('onmousemove', moveMouse);
	    document.attachEvent('onclick', checkMove);
	} else {
	    window.addEventListener('load', init, false);
	    document.addEventListener('mousemove', moveMouse, false);
	    document.addEventListener('click', checkMove, false);
	}
	var oDv = document.createElement("div");
	var dvHdr = document.createElement("div");
	var dvBdy = document.createElement("div");
	var windowlock, boxMove, fixposx, fixposy, lockX, lockY, fixx, fixy, ox, oy, boxLeft, boxRight, boxTop, boxBottom, evt, mouseX, mouseY, boxOpen, totalScrollTop, totalScrollLeft;
	boxOpen = false;
	ox = 10;
	oy = 10;
	lockX = 0;
	lockY = 0;
	
	function init() {
	    oDv.appendChild(dvHdr);
	    oDv.appendChild(dvBdy);
	    oDv.style.position = "absolute";
	    oDv.style.visibility = 'hidden';
	    oDv.style.zIndex = "200";
	    document.body.appendChild(oDv);
	}
	
	function defHdrStyle() {}
	
	function defBdyStyle() {
	    dvBdy.style.fontFamily = 'arial';
	    dvBdy.style.fontSize = '14';
	    dvBdy.style.textAlign = 'left';
	    dvBdy.style.padding = '0';
	    dvBdy.style.color = '#000';
	    dvBdy.style.background = '#fff';
	    dvBdy.style.filter = 'alpha(opacity=100)'; // IE
	    dvBdy.style.opacity = '1'; // FF
	}
	
	function checkElemBO(txt) {
	    if (!txt || typeof (txt) != 'string') return false;
	    if ((txt.indexOf('body') > -1) && (txt.indexOf('[') > -1) && (txt.indexOf('[') > -1)) return true;
	    else return false;
	}
	
	function scanBO(curNode) {
	    if (checkElemBO(curNode.title)) {
	        curNode.boHDR = getParam('header', curNode.title);
	        curNode.boBDY = getParam('body', curNode.title);
	        curNode.boCSSBDY = getParam('cssbody', curNode.title);
	        curNode.boCSSHDR = getParam('cssheader', curNode.title);
	        curNode.IEbugfix = (getParam('hideselects', curNode.title) == 'on') ? true : false;
	        curNode.fixX = parseInt(getParam('fixedrelx', curNode.title));
	        curNode.fixY = parseInt(getParam('fixedrely', curNode.title));
	        curNode.absX = parseInt(getParam('fixedabsx', curNode.title));
	        curNode.absY = parseInt(getParam('fixedabsy', curNode.title));
	        curNode.offY = (getParam('offsety', curNode.title) != '') ? parseInt(getParam('offsety', curNode.title)) : 10;
	        curNode.offX = (getParam('offsetx', curNode.title) != '') ? parseInt(getParam('offsetx', curNode.title)) : 10;
	        curNode.fade = (getParam('fade', curNode.title) == 'on') ? true : false;
	        curNode.fadespeed = (getParam('fadespeed', curNode.title) != '') ? getParam('fadespeed', curNode.title) : 0.04;
	        curNode.delay = (getParam('delay', curNode.title) != '') ? parseInt(getParam('delay', curNode.title)) : 0;
	        if (getParam('requireclick', curNode.title) == 'on') {
	            curNode.requireclick = true;
	            document.all ? curNode.attachEvent('onclick', showHideBox) : curNode.addEventListener('click', showHideBox, false);
	            document.all ? curNode.attachEvent('onmouseover', hideBox) : curNode.addEventListener('mouseover', hideBox, false);
	        } else { // Note : if requireclick is on the stop clicks are ignored   		
	            if (getParam('doubleclickstop', curNode.title) != 'off') {
	                document.all ? curNode.attachEvent('ondblclick', pauseBox) : curNode.addEventListener('dblclick', pauseBox, false);
	            }
	            if (getParam('singleclickstop', curNode.title) == 'on') {
	                document.all ? curNode.attachEvent('onclick', pauseBox) : curNode.addEventListener('click', pauseBox, false);
	            }
	        }
	        curNode.windowLock = getParam('windowlock', curNode.title).toLowerCase() == 'off' ? false : true;
	        curNode.title = '';
	        curNode.hasbox = 1;
	    } else curNode.hasbox = 2;
	}
	
	function getParam(param, list) {
	    var reg = new RegExp('([^a-zA-Z]' + param + '|^' + param + ')\\s*=\\s*\\[\\s*(((\\[\\[)|(\\]\\])|([^\\]\\[]))*)\\s*\\]');
	    var res = reg.exec(list);
	    var returnvar;
	    if (res) return res[2].replace('[[', '[').replace(']]', ']');
	    else return '';
	}
	
	function Left(elem) {
	    var x = 0;
	    if (elem.calcLeft) return elem.calcLeft;
	    var oElem = elem;
	    while (elem) {
	        if ((elem.currentStyle) && (!isNaN(parseInt(elem.currentStyle.borderLeftWidth))) && (x != 0)) x += parseInt(elem.currentStyle.borderLeftWidth);
	        x += elem.offsetLeft;
	        elem = elem.offsetParent;
	    }
	    oElem.calcLeft = x;
	    return x;
	}
	
	function Top(elem) {
	    var x = 0;
	    if (elem.calcTop) return elem.calcTop;
	    var oElem = elem;
	    while (elem) {
	        if ((elem.currentStyle) && (!isNaN(parseInt(elem.currentStyle.borderTopWidth))) && (x != 0)) x += parseInt(elem.currentStyle.borderTopWidth);
	        x += elem.offsetTop;
	        elem = elem.offsetParent;
	    }
	    oElem.calcTop = x;
	    return x;
	}
	
	var ah, ab;
	
	function applyStyles() {
	    if (ab) oDv.removeChild(dvBdy);
	    if (ah) oDv.removeChild(dvHdr);
	    dvHdr = document.createElement("div");
	    dvBdy = document.createElement("div");
	    CBE.boCSSBDY ? dvBdy.className = CBE.boCSSBDY : defBdyStyle();
	    CBE.boCSSHDR ? dvHdr.className = CBE.boCSSHDR : defHdrStyle();
	    dvHdr.innerHTML = CBE.boHDR;
	    dvBdy.innerHTML = CBE.boBDY;
	    ah = false;
	    ab = false;
	    if (CBE.boHDR != '') {
	        oDv.appendChild(dvHdr);
	        ah = true;
	    }
	    if (CBE.boBDY != '') {
	        oDv.appendChild(dvBdy);
	        ab = true;
	    }
	}
	
	var CSE, iterElem, LSE, CBE, LBE, totalScrollLeft, totalScrollTop, width, height;
	var ini = false;
	// Customised function for inner window dimension
	
	function SHW() {
	    if (document.body && (document.body.clientWidth != 0)) {
	        width = document.body.clientWidth;
	        height = document.body.clientHeight;
	    }
	    if (document.documentElement && (document.documentElement.clientWidth != 0) && (document.body.clientWidth + 20 >= document.documentElement.clientWidth)) {
	        width = document.documentElement.clientWidth;
	        height = document.documentElement.clientHeight;
	    }
	    return [width, height];
	}
	
	var ID = null;
	
	function moveMouse(e) {
	    //boxMove=true;
	    e ? evt = e : evt = event;
	    CSE = evt.target ? evt.target : evt.srcElement;
	    if (!CSE.hasbox) {
	        // Note we need to scan up DOM here, some elements like TR don't get triggered as srcElement
	        iElem = CSE;
	        while ((iElem.parentNode) && (!iElem.hasbox)) {
	            scanBO(iElem);
	            iElem = iElem.parentNode;
	        }
	    }
	
	    if ((CSE != LSE) && (!isChild(CSE, dvHdr)) && (!isChild(CSE, dvBdy))) {
	        if (!CSE.boxItem) {
	            iterElem = CSE;
	            while ((iterElem.hasbox == 2) && (iterElem.parentNode))
	            iterElem = iterElem.parentNode;
	            CSE.boxItem = iterElem;
	        }
	        iterElem = CSE.boxItem;
	        if (CSE.boxItem && (CSE.boxItem.hasbox == 1)) {
	            LBE = CBE;
	            CBE = iterElem;
	            if (CBE != LBE) {
	                applyStyles();
	                if (!CBE.requireclick) if (CBE.fade) {
	                    if (ID != null) clearTimeout(ID);
	                    ID = setTimeout(function () {
	                    	fadeIn(CBE.fadespeed);
	                    }, CBE.delay);
	                } else {
	                    if (ID != null) clearTimeout(ID);
	                    COL = 1;
	                    ID = setTimeout(function () {
	                    	oDv.style.visibility='visible';
	                    	ID=null;
	                    }, CBE.delay);
	                }
	                if (CBE.IEbugfix) {
	                    hideSelects();
	                }
	                fixposx = !isNaN(CBE.fixX) ? Left(CBE) + CBE.fixX : CBE.absX;
	                fixposy = !isNaN(CBE.fixY) ? Top(CBE) + CBE.fixY : CBE.absY;
	                lockX = 0;
	                lockY = 0;
	                boxMove = true;
	                ox = CBE.offX ? CBE.offX : 10;
	                oy = CBE.offY ? CBE.offY : 10;
	            }
	        } else if (!isChild(CSE, dvHdr) && !isChild(CSE, dvBdy) && (boxMove)) {
	            // The conditional here fixes flickering between tables cells.
	            if ((!isChild(CBE, CSE)) || (CSE.tagName != 'TABLE')) {
	                CBE = null;
	                if (ID != null) clearTimeout(ID);
	                fadeOut();
	                showSelects();
	            }
	        }
	        LSE = CSE;
	    } else if (((isChild(CSE, dvHdr) || isChild(CSE, dvBdy)) && (boxMove))) {
	        totalScrollLeft = 0;
	        totalScrollTop = 0;
	
	        iterElem = CSE;
	        while (iterElem) {
	            if (!isNaN(parseInt(iterElem.scrollTop))) totalScrollTop += parseInt(iterElem.scrollTop);
	            if (!isNaN(parseInt(iterElem.scrollLeft))) totalScrollLeft += parseInt(iterElem.scrollLeft);
	            iterElem = iterElem.parentNode;
	        }
	        if (CBE != null) {
	            boxLeft = Left(CBE) - totalScrollLeft;
	            boxRight = parseInt(Left(CBE) + CBE.offsetWidth) - totalScrollLeft;
	            boxTop = Top(CBE) - totalScrollTop;
	            boxBottom = parseInt(Top(CBE) + CBE.offsetHeight) - totalScrollTop;
	            doCheck();
	        }
	    }
	    if (boxMove && CBE) {
	        // This added to alleviate bug in IE6 w.r.t DOCTYPE
	        bodyScrollTop = document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
	        bodyScrollLet = document.documentElement && document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;
	        mouseX = evt.pageX ? evt.pageX - bodyScrollLet : evt.clientX - document.body.clientLeft;
	        mouseY = evt.pageY ? evt.pageY - bodyScrollTop : evt.clientY - document.body.clientTop;
	        if ((CBE) && (CBE.windowLock)) {
	            mouseY < -oy ? lockY = -mouseY - oy : lockY = 0;
	            mouseX < -ox ? lockX = -mouseX - ox : lockX = 0;
	            mouseY > (SHW()[1] - oDv.offsetHeight - oy) ? lockY = -mouseY + SHW()[1] - oDv.offsetHeight - oy : lockY = lockY;
	            mouseX > (SHW()[0] - dvBdy.offsetWidth - ox) ? lockX = -mouseX - ox + SHW()[0] - dvBdy.offsetWidth : lockX = lockX;
	        }
	        oDv.style.left = ((fixposx) || (fixposx == 0)) ? fixposx : bodyScrollLet + mouseX + ox + lockX + "px";
	        oDv.style.top = ((fixposy) || (fixposy == 0)) ? fixposy : bodyScrollTop + mouseY + oy + lockY + "px";
	    }
	}
	
	function doCheck() {
	    if ((mouseX < boxLeft) || (mouseX > boxRight) || (mouseY < boxTop) || (mouseY > boxBottom)) {
	        if (!CBE.requireclick) fadeOut();
	        if (CBE.IEbugfix) {
	            showSelects();
	        }
	        CBE = null;
	    }
	}
	
	function pauseBox(e) {
	    e ? evt = e : evt = event;
	    boxMove = false;
	    evt.cancelBubble = true;
	}
	
	function showHideBox(e) {
	    oDv.style.visibility = (oDv.style.visibility != 'visible') ? 'visible' : 'hidden';
	}
	
	function hideBox(e) {
	    oDv.style.visibility = 'hidden';
	}
	
	var COL = 0;
	var stopfade = false;
	
	function fadeIn(fs) {
	    ID = null;
	    COL = 0;
	    oDv.style.visibility = 'visible';
	    fadeIn2(fs);
	}
	
	function fadeIn2(fs) {
	    COL = COL + fs;
	    COL = (COL > 1) ? 1 : COL;
	    oDv.style.filter = 'alpha(opacity=' + parseInt(100 * COL) + ')';
	    oDv.style.opacity = COL;
	    if (COL < 1) setTimeout(function () {
	    	fadeIn2(fs);
	    }, 20);
	}
	
	
	function fadeOut() {
	    oDv.style.visibility = 'hidden';
	}
	
	function isChild(s, d) {
	    while (s) {
	        if (s == d) return true;
	        s = s.parentNode;
	    }
	    return false;
	}
	
	var cSrc;
	
	function checkMove(e) {
	    e ? evt = e : evt = event;
	    cSrc = evt.target ? evt.target : evt.srcElement;
	    if ((!boxMove) && (!isChild(cSrc, oDv))) {
	        fadeOut();
	        if (CBE && CBE.IEbugfix) {
	            showSelects();
	        }
	        boxMove = true;
	        CBE = null;
	    }
	}
	
	function showSelects() {
	    var elements = document.getElementsByTagName("select");
	    for (i = 0; i < elements.length; i++) {
	        elements[i].style.visibility = 'visible';
	    }
	}
	
	function hideSelects() {
	    var elements = document.getElementsByTagName("select");
	    for (i = 0; i < elements.length; i++) {
	        elements[i].style.visibility = 'hidden';
	    }
	}
})(jQuery1);

/* 
* goTop 效果
*
* 调用方式：
* <script type="text/javascript">jQuery1(function(){jQuery1.goTop();})</script>
*/
(function($){
	$.goTop = function(containerId){
		var flag = true;
		var $a = $('<a href="javascript:void(0)" title="返回顶部" alt="返回顶部" />').html('<img src="'+mokosimg+'/images/goTop.jpg" />').addClass('iBd');
		$a.click(function(){
			var $win = $(window);
			flag = false;			
			var timer = setInterval(function(){
				var scrollTop = $win.scrollTop();
				$win.scrollTop(scrollTop / 2);
				if(scrollTop == 0){
					clearInterval(timer);
					flag = true;
				}
			},40);
			$goTop.fadeOut(10);
		});

		var $div = $('#'+containerId);
		var isIE6 = $.isIE && !window.XMLHttpRequest;
		var position = 'fixed';
		if(isIE6){
			position = 'absolute';
		}
		//火狐向右偏移
		var temp = 1;
		var ua=navigator.userAgent.toLowerCase(),rFirefox = /.*(firefox)\/([\w.]+).*/;
		var match = rFirefox.exec(ua);  
	    if (match != null) {  
	        temp = 0;  
	    }   
		
		
		var marginLeft = parseInt($div.outerWidth() / 2+temp);
		var $goTop = $('<div />').css({'position':position,'bottom':'99px','left':'50%','margin-left':marginLeft,'z-index':'5'}).append($a).hide();
		$goTop.appendTo($div);
		var bottom = parseInt($goTop[0].style.bottom);

		$(window).scroll(function() {
			var scrollTop = $(this).scrollTop();
			if (scrollTop > 0) {
				if(isIE6) //如果是ie6
					$goTop.css({'top': scrollTop + document.documentElement.clientHeight-(bottom + $goTop.outerHeight())});
				if(flag)
					$goTop.fadeIn();
			}else {
				$goTop.css({'bottom': bottom}).fadeOut();
			}
		});
	};	
})(jQuery1);

/**
* 多个普通上传插件
* 
*	//#fileList 父容器
* jQuery1("#fileList").addFile({
*		//可选 默认显示数量 (默认的不可删除)
*		defaultCount : 1,
*		
*		//必须 表单提交的name
*		formName : "",
*		
*		//可选 是否有增加
*		addBtn : false,
*		
*		//可选 最大数量
*		maxCount : 5,
*		
*		//可选 已上传的元素选择器
*		existsSelector : null,
*		
*		//可选 超出数量的提示消息
*		alertMessage : "抱歉，超出上传的最大数量!"	
*	});
*	
*	//还原初始状态（ajax上传完后 有必要可以调）
*  $("#fileList").trigger("clean");
*
*/
(function($){
	$.fn.addFile = function (s) {
		s = $.extend({
			defaultCount : 1,
			formName : "",
			addBtn : false,
			maxCount : 5,
			existsSelector : null,
			alertMessage : "抱歉，超出上传的最大数量!"		
		}, s || {});
		
		var $parent = $(this);
		//上传元素
		function fileElement (allowDel) {
			var $html = $('<div class="moko-file-upload">' +
							  '<input class="file-text" type="text" readonly="true" />' +
							  '<span class="file-browser"><input class="file-browser-btn" value="浏览..." type="button" /><input class="file-browser-input" type="file" name="'+s.formName+'"/></span>' +
						  '</div>');
			if (allowDel) {
				var $delEle = $('<a class="file-remove" href="javascript:void(0)"></a>');
				$delEle.click(function() {
					$html.remove();
					return false;
				});
				$html.append($delEle)
			}
			$html.find("input[type='file']").change(function(){
				$html.find("input[type='text']").val($(this).val());
			}).click(function() {
				if (getExistCount() <= s.maxCount) {
					return true;
				}
				alertMessage();
				return false;
			});
			return $html;
		}
		
		function defaultFile(){
			var count = s.defaultCount;
			while (count > 0) {
				$parent.append(fileElement(false));
				count--;
			}
		}
		
		defaultFile();
		$parent.bind("clean", function(){
			$(this).children().remove();
			defaultFile();
		})
		
		function getExistCount () {
			var existCount = $parent.find('input[type="file"]').size();
			if (s.existsSelector)
				existCount += $(s.existsSelector).size();
			return existCount;
		}
		
		function alertMessage () {
			alert(s.alertMessage);
		}
		
		//添加按钮
		if (s.addBtn) {
			var $addBtn = $('<input/>', {
						"class" : "buttonM_1 font14",
						type : "button",
						value : "+ 增 加",
						onfocus : "blur()"
					});
			$addBtn.click(function(){
				$addBtn.attr("disabled", true);
				//检测数量
				if (getExistCount() < s.maxCount)
					$parent.append(fileElement(true));
				else
					alertMessage();
				$addBtn.attr("disabled", false);
			});
			$(this).after($addBtn);
		}
		
	}
})(jQuery1);

/**
 * 登录邮箱提示插件
 * 需要引人 email-suggest.css
 * <link href="email-suggest.css" rel="stylesheet" type="text/css" />
 * 
 * 	$('#login-email').emailSuggest();
 * 	
 */
(function($){
	$.fn.emailSuggest=function(options){
		var emailList = ['@163.com','@qq.com','@126.com','@hotmail.com','@gmail.com','@sohu.com','@yahoo.com.cn','@yahoo.com','@sina.com','@msn.com','@live.cn'];
		var $suggestList = null;
		var _init = function(){
			$suggestList = $('#email-suggest-list');
			if($suggestList[0] == undefined){
				$suggestList = $('<ul>',{'id':'email-suggest-list'}).appendTo(document.body);
			}
			$(document).bind('click',function(){
				$suggestList.hide();
			});
		}();
		var _getList = function(obj){
			var value = obj.value;
			if(value == ''){
				$suggestList.empty().hide();
				return ;
			}
			$suggestList.empty().show();
			var index = value.indexOf("@");
			var afterText = "@";
			if(index != -1){
				beforeText = value.substring(0,index);
				afterText = value.substring(index);
				value = beforeText;
			}
			
			$.each(emailList,function(i,mail){
				if(mail.indexOf(afterText) != -1){
					$('<li>').append($('<a href="javascript:void(0)" />').html(value + mail)).appendTo($suggestList).bind('click',function(){
						obj.value = value + mail;
						$suggestList.focus().hide();
					});
				}
			});	
			if($suggestList.find('li').length <= 0){
				$suggestList.hide();
				return ;
			}
			$('#email-suggest-list li a:first').addClass("active");
		}
		this.each(function(){
			var $this = $(this);
			$this.bind({
				'keyup':function(event){					
					//计算ul列表的宽度及位置
					$suggestList.width($this.outerWidth() - parseInt($suggestList.css('padding-left')) - parseInt($suggestList.css('padding-right')) -2);
					$suggestList.css({'left':$this.offset().left,'top':$this.offset().top + $this.outerHeight()});
					var keyCode = event.keyCode;
					if(keyCode != 40 && keyCode != 38 && keyCode != 13)
						_getList(this);
				},
				'keydown':function(event){
					var keyCode = event.keyCode;
					var $li = null;
					var $a = $('#email-suggest-list a[class="active"]');
					if(keyCode==40){//当弹出列表时 按下箭头
						$li = $a.toggleClass("active").parent('li').next();
						if($li[0] == undefined)
							$li = $a.parents('ul').children('li:first');
						$li.children('a').toggleClass("active");
						return false;
					}
					else if(keyCode == 38){ //当弹出列表时 按上箭头
						$li = $a.toggleClass("active").parent('li').prev();
						if($li[0] == undefined)
							$li = $a.parents('ul').children('li:last');
						$li.children('a').toggleClass("active");
						return false;
					}
					else if(keyCode == 13 || keyCode==9){ //回车 或者 TAB 时
						if(emailList.length == undefined || emailList.length <= 0)
							return ;
						var mail = emailList[$a.parent('li').index()]; //找到当前li的下标
						if($a.text() != '')
							$this.val($a.text());
						$suggestList.hide();
						$('#login-pass').focus();
						return false;
					}
				}
			});
		});
		return this;
	};
})(jQuery1);
/**
 * 使用说明：
 * 需要引人 moko-select.css
 * 使用方法一：
 * html：
 *	<select name="sex" >
 *		<option value="1">man</option>
 *		<option value="2">woman</option>
 *	</select>
 * js：
 * $('select').select();
 *
 * 使用方法二：从网络中加载数据
 * $('select').select({url:'1.jsp'});
 *
 * 使用方法三：绑定时传入数据内容
 * $('select').select({data:[{text:'1000',value:'1千'},{text:'10000',value:'1万'}]});
 *
 * 使用default 设置默认选中
 * 	<select name="ttt" id="ttt" default="2">
 *		<option value="1">测试1</option>
 *		<option value="2">测试2</option>
 *		<option value="3">测试3</option>
 *	</select>
 *
 */
(function($){
	$.fn.select = function(options){
		//定义常量
		var settings = $.extend({},options);
		
		this.each(function() {
			//html template
			var $html = $('<span class="ui-select"><span class="default"><span></span><label>▼</label></span><br/><ul></ul></span>');
			//将下拉框隐藏，把模版插入其后
			var $this = $(this).hide().after($html);
			//声明全局变量
			var $list = $html.find('ul'),$default = $html.find('.default'),$span = $default.find('span'),$label = $default.find('label');
			//从网络加载数据
			if(settings.url){
				$.ajax({
					url: settings.url,
					dataType:'json',
					async : false,
					success: function(data){
						//得到已经存在的option个数
						var size = $this.find('option').size();
						$.each(data,function(i,option){
							//由于ie6 的bug ，不得不采用原生的方式对DOM进行操作
							$this[0].options[i+size] = new Option(option.text,option.value);
						});
					}
				});
			}
			//直接加载数据
			if(settings.data){
				//得到已经存在的option个数
				var size = $this.find('option').size();
				$.each(settings.data,function(i,option){
					//由于ie6 的bug ，不得不采用原生的方式对DOM进行操作
					$this[0].options[i+size] = new Option(option.text,option.value);
				});
			}
			
			//将option遍历到li中
			$this.find('option').each(function(){
				var $option = $(this);
				$('<li val="'+$option.val()+'">'+$option.text()+'</li>').appendTo($list);
				//默认选中
				if($option.prop('selected') === true){
					$this.val($option.val());
					$span.text($option.text());
				}
				//默认选中
				if($this.attr('default') == $option.val()){
					$this.val($option.val());
					$span.text($option.text());
					$option.prop('selected',true);
				}			
				
			});
			
			if($span.text() === ''){
				var $li = $list.find('li').first();
				$this.val($li.attr('val'));
				$span.text($li.text());
			}
			//click 事件
			$default.click(function(event){
				$('.ui-select ul').not($list).hide();
				//阻止事件冒泡
				event.stopPropagation();
				if(!$list.find('li').size())
					return ;
				$list.toggle();
			});

			
			$list.find('li').click(function(){
				var $li = $(this);
				$span.text($li.text());
				if($this.val() != $li.attr('val'))
					$this.val($li.attr('val')).change();
			}).hover(function(){
				$(this).toggleClass('active');
			});
			
			$this.change(function(){
				var index = $this[0].selectedIndex,$li = $list.find('li:eq('+index+')');
				$span.text($li.text());
			});

			$(document).click(function(){
				$list.slideUp(200);
			});

			//计算下拉框宽度
			$list.width($default.outerWidth());

		});
		return this;
	};
})(jQuery1);
/**
 * 地址选择器
 * 需要引入 moko-address.css
 * isShowAllArea:true 是否显示全部
 * 调用方法:
 * 	jQuery1(function(){
 *		jQuery1('.address').LocationSelect({isShowAllArea:true,'callback':function(data){
 *			alert('国家：'+data.country.id +'，省:'+data.province.id+'，城市:'+data.city.id);
 *			alert('国家：'+data.country.name +'，省:'+data.province.name+'，城市:'+data.city.name);
 *		}});
 *	});
 */
(function($){
	$.fn.LocationSelect = function(options){		
		
		if(this.size() < 1)
			return;
		
		var $address = $('#moko-address'),$province = $address.find('.province'),$city = $address.find('.city');
		(function(){
			if($address[0])
				return ;

			var html = '<div id="moko-address">\
							<p class="province"></p>\
							<p class="city"></p>\
							<div class="address-bottom"><input type="button" class="btn" onfocus="blur()" value="关 闭"></div>\
						</div>';
			$address = $(html).appendTo(document.body),$province = $address.find('.province'),$city = $address.find('.city');
		})();
		this.each(function() {
			var $this = $(this),local = $this.attr('url');
			//定义常量
			$this.settings = $.extend({
				province:{url:'/area|ajaxShowProvince.action?callback=?'},
				city:{url:'/area|ajaxShowCity.action?callback=?'},
				callback:function(data){},
				isShowAllArea:false //是否显示全部
			},options);
			
			if(local){
				$this.settings.province.url = local + $this.settings.province.url;
				$this.settings.city.url = local + $this.settings.city.url;
			}
			$this.click(function(){
				//隐藏市
				$city.attr('provinceId',-1).hide();
				if(!$province.has('a').length){
					$.ajax({'url':$this.settings.province.url,'async':false,'dataType':'json','success':function(json){
						//循环结果集
						$.each(json.areaList,function(i,province){
							//创建省
							$('<a href="javascript:void(0);" hidefocus="true" parentId="'+province.id+'">'+province.name+'</a>').appendTo($province);
						});
						//添加海外
						$('<a href="javascript:void(0);" hidefocus="true" parentId="0">海外</a>').appendTo($province);
						//添加全部
						$('<a href="javascript:void(0);" hidefocus="true" parentId="-1" class="all">全部</a>').hide().appendTo($province);
							
						//点击省
						$province.find('a').click(function(){			
							var _this = $(this),parentId = _this.attr('parentId'),$this = $address.data('target');
							
							if(parentId == -1){
								$this.val(_this.text());

								$this.settings.callback.call(this,{
									'country':{'name':'','id':0},
									'province':{'name':'','id':0},
									'city':{'name':'','id':0}
								});	
								$address.hide();
								return ;
							}
							
							if($city.attr('provinceId') == parentId)
								return ;
							
							$.getJSON($this.settings.city.url,{'parentId':parentId},function(json){
								//如果没有城市数据，则为直辖市，将直辖市的信息返回
								if(json.areaList == undefined){
									$this.val(_this.text());

									$this.settings.callback.call(this,{
										'country':{'name':'中国','id':1},
										'province':{'name':_this.text(),'id':parentId},
										'city':{'name':'','id':0}
									});	
									$city.attr('provinceId',parentId).hide();
									$address.hide();
									return ;
								}
								$city.hide(0,function(){
									//清空城市
									$city.empty();
									$.each(json.areaList,function(i,city){
										$('<a href="javascript:void(0);" hidefocus="true">'+city.name+'</a>').click(function(){
											$this.val(city.name);
											if(parentId !=0){
												$this.settings.callback.call(this,{
													'country':{'name':'中国','id':1},
													'province':{'name':_this.text(),'id':parentId},
													'city':{'name':city.name,'id':city.id}
												});
											}
											else{
												$this.settings.callback.call(this,{
													'country':{'name':city.name,'id':city.id},
													'province':{'name':0,'id':0},
													'city':{'name':0,'id':0}
												});
											}
											$city.hide();
											$address.hide();
										}).appendTo($city);
									});
									$city.attr('provinceId',parentId).show();
								});
							});			
						});
					}});
				}
				$address.show().data('target',$this);
				if($this.settings.isShowAllArea) //显示全部
					$province.find('.all').show();
				else
					$province.find('.all').hide();
				var pos = $this.attr('address-position');
				var left = $this.offset().left;
				if(pos == 'center')
					left -= Math.abs(left - $address.width()) / 2;
				else if(pos == 'right')
					left = left+$this.outerWidth() - $address.outerWidth();
				
				$address.css({'left':left,'top':$this.offset().top + $this.outerHeight()+5});
			});
			
						
		});
		
		//关闭
		$address.find('.btn').click(function(){
			$city.hide();
			$address.hide();
		});
		
	};
})(jQuery1);