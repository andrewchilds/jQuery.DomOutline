
var DomOutline = function (options) {
    options = options || {};

    var pub = {};
    var self = {
        opts: {
            namespace: options.namespace || 'DomOutline',
            borderWidth: options.borderWidth || 2,
            onClick: options.onClick || false,
            filter: options.filter || false,
            dontStop: !options.stopOnClick || false
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
        if (self.initialized !== true) {
            var css = '' +
                '.' + self.opts.namespace + ' {' +
                '    background: #09c;' +
                '    position: absolute;' +
                '    z-index: 1000000;' +
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
                '}';

            writeStylesheet(css);
            self.initialized = true;
        }
    }

    function createOutlineElements() {
        var divLabel = document.createElement('div');
        divLabel.classList.add(self.opts.namespace + '_label');

        var divTop = document.createElement('div');
        divTop.classList.add(self.opts.namespace);

        var divBottom = document.createElement('div');
        divBottom.classList.add(self.opts.namespace);

        var divLeft = document.createElement('div');
        divLeft.classList.add(self.opts.namespace);

        var divRight = document.createElement('div');
        divRight.classList.add(self.opts.namespace);

        var el = document.querySelector('body');

        self.elements.label = el.appendChild(divLabel);
        self.elements.top = el.appendChild(divTop);
        self.elements.bottom = el.appendChild(divBottom);
        self.elements.left = el.appendChild(divLeft);
        self.elements.right = el.appendChild(divRight);
    }

    function removeOutlineElements() {
        [].forEach.call(self.elements, function (name, element) {
            element.remove();
        });
    }

    function compileLabelText(element, width, height) {
        var label = element.tagName.toLowerCase();
        if (element.id) {
            label += '#' + element.id;
        }
        if (element.className) {
            label += ('.' + element.className.trim().replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
    }

    function getScrollTop(e) {
        if (!self.elements.window) {
            self.elements.window = window;
        }

        scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        return scrollTop;
    }

    function updateOutlinePosition(e) {
        if (e.target.className.indexOf(self.opts.namespace) !== -1) {
            return;
        }
        if (self.opts.filter) {
            if (!e.target.tagName === self.opts.filter) {
                return;
            }
        }
        pub.element = e.target;

        var b = self.opts.borderWidth;
        var scroll_top = getScrollTop(e);
        var pos = pub.element.getBoundingClientRect();
        var top = pos.top + scroll_top;

        var label_text = compileLabelText(pub.element, pos.width, pos.height);
        var label_top = Math.max(0, top - 20 - b, scroll_top) + 'px';
        var label_left = Math.max(0, pos.left - b) + 'px';

        // self.elements.label.css({ top: label_top, left: label_left }).text(label_text);
        self.elements.label.style.top = label_top;
        self.elements.label.style.left = label_left;
        self.elements.label.textContent = label_text

        // self.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
        self.elements.top.style.top = Math.max(0, top - b) + 'px';
        self.elements.top.style.left = (pos.left - b) + 'px';
        self.elements.top.style.width = (pos.width + b) + 'px';
        self.elements.top.style.height = b + 'px';

        // self.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
        self.elements.bottom.style.top = (top + pos.height) + 'px';
        self.elements.bottom.style.left = (pos.left - b) + 'px';
        self.elements.bottom.style.width = (pos.width + b) + 'px';
        self.elements.bottom.style.height = b + 'px';

        // self.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
        self.elements.left.style.top = (top - b) + 'px';
        self.elements.left.style.left = Math.max(0, pos.left - b) + 'px';
        self.elements.left.style.width = b + 'px';
        self.elements.left.style.height = (pos.height + b) + 'px';

        // self.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
        self.elements.right.style.top = (top - b) + 'px';
        self.elements.right.style.left = (pos.left + pos.width) + 'px';
        self.elements.right.style.width = b + 'px';
        self.elements.right.style.height = (pos.height + (b * 2)) + 'px';
    }

    function stopOnEscape(e) {
        if (e.keyCode === self.keyCodes.ESC || e.keyCode === self.keyCodes.BACKSPACE || e.keyCode === self.keyCodes.DELETE) {
            pub.stop();
        }

        return false;
    }

    function clickHandler(e) {
        if (!self.opts.dontStop) pub.stop();

        self.opts.onClick.call(pub.element, e);

        return false;
    }

    function filterOption(e) {
        if (self.opts.filter) {
            if (!e.target.tagName === self.opts.filter) {
                return false;
            }
        }
        clickHandler.call(this, e);
    }

    pub.start = function () {
        initStylesheet();
        if (self.active !== true) {
            self.active = true;
            createOutlineElements();
            var body = document.querySelector('body')
            body.addEventListener('mousemove', updateOutlinePosition);
            body.addEventListener('keyup', stopOnEscape);
            if (self.opts.onClick) {
                setTimeout(function () {
                    body.addEventListener('click', filterOption);
                }, 50);
            }
        }
    };

    pub.stop = function () {
        self.active = false;
        removeOutlineElements();
        var body = document.querySelector('body')
        body.removeEventListener('mousemove', updateOutlinePosition);
        body.removeEventListener('keyup', stopOnEscape);
        body.removeEventListener('click', filterOption);
    };

    return pub;
};
