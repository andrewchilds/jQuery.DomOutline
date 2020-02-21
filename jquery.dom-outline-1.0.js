/**
 * Firebug/Web Inspector Outline Implementation using jQuery
 * Tested to work in Chrome, FF, Safari. Buggy in IE ;(
 * Andrew Childs <ac@glomerate.com>
 *
 * Example Setup:
 * let myClickHandler = function (element) { console.log('Clicked element:', element); }
 * let myDomOutline = DomOutline({ onClick: myClickHandler, filter: '.debug' });
 *
 * Public API:
 * myDomOutline.start();
 * myDomOutline.stop();
 */
var DomOutline = function (options) {
    let pub = {};
    let jsonSelf = {
        opts: jQuery.extend({
            // default options
            namespace: 'DomOutline',
            borderWidth: 2,
            onClick: false,
            filter: false,
            stopWhenClicked: true
        }, options || {}),
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
        let element = document.createElement('style');
        element.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(element);

        if (element.styleSheet) {
            element.styleSheet.cssText = css; // IE
        } else {
            element.innerHTML = css; // Non-IE
        }
    }

    function initStylesheet() {
        if (jsonSelf.initialized !== true) {
            let css = '' +
                '.' + jsonSelf.opts.namespace + ' {' +
                '    background: #09c;' +
                '    position: absolute;' +
                '    z-index: 1000000;' +
                '}' +
                '.' + jsonSelf.opts.namespace + '_label {' +
                '    background: #09c;' +
                '    border-radius: 2px;' +
                '    color: #fff;' +
                '    font: bold 12px/12px Helvetica, sans-serif;' +
                '    padding: 4px 6px;' +
                '    position: absolute;' +
                '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                '    z-index: 1000001;' +
                '}';

            writeStylesheet(css);
            jsonSelf.initialized = true;
        }
    }

    function createOutlineElements() {
        jsonSelf.elements.label = jQuery('<div></div>').addClass(jsonSelf.opts.namespace + '_label').appendTo('body');
        jsonSelf.elements.top = jQuery('<div></div>').addClass(jsonSelf.opts.namespace).appendTo('body');
        jsonSelf.elements.bottom = jQuery('<div></div>').addClass(jsonSelf.opts.namespace).appendTo('body');
        jsonSelf.elements.left = jQuery('<div></div>').addClass(jsonSelf.opts.namespace).appendTo('body');
        jsonSelf.elements.right = jQuery('<div></div>').addClass(jsonSelf.opts.namespace).appendTo('body');
    }

    function removeOutlineElements() {
        jQuery.each(jsonSelf.elements, function(name, element) {
            element.remove();
        });
    }

    function compileLabelText(element, width, height) {
        let label = element.tagName.toLowerCase();
        if (element.id) {
            label += '#' + element.id;
        }
        if (element.className) {
            label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
    }

    function getScrollTop() {
        if (!jsonSelf.elements.window) {
            jsonSelf.elements.window = jQuery(window);
        }
        return jsonSelf.elements.window.scrollTop();
    }

    function updateOutlinePosition(e) {
        if (e.target.className.indexOf(jsonSelf.opts.namespace) !== -1) {
            return;
        }
        if (jsonSelf.opts.filter) {
            if (!jQuery(e.target).is(jsonSelf.opts.filter)) {
                return;
            }
        }      
        pub.element = e.target;

        let b = jsonSelf.opts.borderWidth;
        let scroll_top = getScrollTop();
        let pos = pub.element.getBoundingClientRect();
        let top = pos.top + scroll_top;

        let label_text = compileLabelText(pub.element, pos.width, pos.height);
        let label_top = Math.max(0, top - 20 - b, scroll_top);
        let label_left = Math.max(0, pos.left - b);

        jsonSelf.elements.label.css({ top: label_top, left: label_left }).text(label_text);
        jsonSelf.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
        jsonSelf.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
        jsonSelf.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
        jsonSelf.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
    }

    function stopOnEscape(e) {
        if (e.keyCode === jsonSelf.keyCodes.ESC || e.keyCode === jsonSelf.keyCodes.BACKSPACE || e.keyCode === jsonSelf.keyCodes.DELETE) {
            pub.stop();
        }

        return false;
    }

    function clickHandler(e) {
        if (jsonSelf.opts.stopWhenClicked) pub.stop();
        jsonSelf.opts.onClick(pub.element);

        return false;
    }

    pub.start = function () {
        initStylesheet();
        if (jsonSelf.active !== true) {
            jsonSelf.active = true;
            createOutlineElements();
            jQuery('body').on('mousemove.' + jsonSelf.opts.namespace, updateOutlinePosition);
            jQuery('body').on('keyup.' + jsonSelf.opts.namespace, stopOnEscape);
            if (jsonSelf.opts.onClick) {
                setTimeout(function () {
                    jQuery('body').on('click.' + jsonSelf.opts.namespace, function(e){
                        if (jsonSelf.opts.filter) {
                            if (!jQuery(e.target).is(jsonSelf.opts.filter)) {
                                return false;
                            }
                        }
                        clickHandler.call(this, e);
                    });
                }, 50);
            }
        }
    };

    pub.stop = function () {
        jsonSelf.active = false;
        removeOutlineElements();
        jQuery('body').off('mousemove.' + jsonSelf.opts.namespace)
            .off('keyup.' + jsonSelf.opts.namespace)
            .off('click.' + jsonSelf.opts.namespace);
    };

    return pub;
};
