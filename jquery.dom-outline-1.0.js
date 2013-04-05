/*global document:false*/
/*global window:false*/
/*global jQuery:false*/
/*global setTimeout:false*/

/**
 * Firebug/Web Inspector Outline Implementation using jQuery
 * Tested to work in Chrome, FF, Safari. Buggy in IE ;(
 * Andrew Childs <ac@glomerate.com>
 *
 * Example Setup:
 * var myClickHandler = function (element) { console.log('Clicked element:', element); }
 * var myDomOutline = DomOutline({ onClick: myClickHandler });
 *
 * Public API:
 * myDomOutline.start();
 * myDomOutline.stop();
 */
var DomOutline = function (options) {
	'use strict';

	options = options || {};

	var pub = {},
		self = {
			opts: {
				namespace: options.namespace || 'DomOutline',
				borderWidth: options.borderWidth || 2,
				onClick: options.onClick || false,
				border: options.border || false,
				realtime: options.realtime || false,
				label: options.label || false
			},
			keyCodes: {
				BACKSPACE: 8,
				ESC: 27,
				DELETE: 46
			},
			active: false,
			initialized: false,
			elements: {}
		};

	function writeStylesheet(css) {
		var element = document.createElement('style');
		element.type = 'text/css';
		document.getElementsByTagName('head')[0].appendChild(element);

		if (element.styleSheet) {
			element.styleSheet.cssText = css; // IE
		} else {
			element.innerHTML = css; // Non-IE
		}
	}

	function initStylesheet() {
		var css = '';

		if (self.initialized !== true) {
			css +=
				'.' + self.opts.namespace + ' {' +
				'    background: rgba(0, 153, 204, 0.5);' +
				'    position: absolute;' +
				'    z-index: 1000000;' +
				'    pointer-events: none;' +
				'}' +
				'.' + self.opts.namespace + '_label {' +
				'    background: #09c;' +
				'    border-radius: 2px;' +
				'    color: #fff;' +
				'    font: bold 12px/12px Helvetica, sans-serif;' +
				'    padding: 4px 6px;' +
				'    position: absolute;' +
				'    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
				'    z-index: 1000001;' +
				'    pointer-events: none;' +
				'}' +
				'.' + self.opts.namespace + '_box {' +
				'    background: rgba(0, 153, 204, 0.5);' +
				'    position: absolute;' +
				'    z-index: 1000000;' +
				'    pointer-events: none;' +
				'}';

			writeStylesheet(css);
			self.initialized = true;
		}
	}

	function createOutlineElements() {
		self.elements.label = jQuery('<div>').addClass(self.opts.namespace + '_label').appendTo('body');
		self.elements.top = jQuery('<div>').addClass(self.opts.namespace).appendTo('body');
		self.elements.bottom = jQuery('<div>').addClass(self.opts.namespace).appendTo('body');
		self.elements.left = jQuery('<div>').addClass(self.opts.namespace).appendTo('body');
		self.elements.right = jQuery('<div>').addClass(self.opts.namespace).appendTo('body');

		self.elements.box = jQuery('<div>').addClass(self.opts.namespace + '_box').appendTo('body');
	}

	function removeOutlineElements() {
		jQuery.each(self.elements, function (name, element) {
			element.remove();
		});
	}

	function compileLabelText(element, width, height) {
		var label = element.tagName.toLowerCase();
		if (element.id) {
			label += '#' + element.id;
		}
		if (element.className) {
			label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
		}
		return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
	}

	function getScrollTop() {
		if (!self.elements.window) {
			self.elements.window = jQuery(window);
		}
		return self.elements.window.scrollTop();
	}

	function stopOnEscape(e) {
		if (e.keyCode === self.keyCodes.ESC || e.keyCode === self.keyCodes.BACKSPACE || e.keyCode === self.keyCodes.DELETE) {
			pub.stop();
		}

		return false;
	}

	function draw(e) {
		if (e.target.className.indexOf(self.opts.namespace) !== -1) {
			return;
		}

		pub.element = e.target;

		var b = self.opts.borderWidth,
			scroll_top = getScrollTop(),
			pos = pub.element.getBoundingClientRect(),
			top = pos.top + scroll_top,
			label_text = '',
			label_top = 0,
			label_left = 0;

		if (self.opts.label) {
			label_text = compileLabelText(pub.element, pos.width, pos.height);
			label_top = Math.max(0, top - 20 - b, scroll_top);
			label_left = Math.max(0, pos.left - b);
			self.elements.label.css({ top: label_top, left: label_left }).text(label_text);
		}

		if (self.opts.border) {
			self.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
			self.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
			self.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
			self.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
		} else {
			self.elements.box.css({
				top: pos.top,
				left: pos.left,
				width: pos.width,
				height: pos.height
			});
		}
	}

	function clickHandler(e) {
		if (!self.opts.realtime) {
			draw(e);
		}

		self.opts.onClick(pub.element);
		return false;
	}

	pub.start = function () {
		initStylesheet();
		if (self.active !== true) {
			self.active = true;
			createOutlineElements();

			jQuery('body').bind('keyup.' + self.opts.namespace, stopOnEscape);
			if (self.opts.onClick) {
				setTimeout(function () {
					jQuery('body').bind('click.' + self.opts.namespace, clickHandler);
				}, 50);
			}

			if (self.opts.realtime) {
				jQuery('body').bind('mousemove.' + self.opts.namespace, draw);
			}
		}
	};

	pub.stop = function () {
		self.active = false;
		removeOutlineElements();
		jQuery('body').unbind('mousemove.' + self.opts.namespace)
			.unbind('keyup.' + self.opts.namespace)
			.unbind('click.' + self.opts.namespace);
	};

	return pub;
};
