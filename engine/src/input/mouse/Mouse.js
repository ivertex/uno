/**
 * Mouse is responsible for handling all aspects of mouse interaction
 * @namespace
 */
uno.Mouse = function() {
    /**
     * @memberof uno.Mouse
     * @member {Number} _button - Current mouse button pressed
     * @private
     */
    this._button = 0;

    /**
     * @memberof uno.Mouse
     * @member {uno.Point} _position - Current mouse pointer position (in global space, not in render space)
     * @private
     */
    this._position = new uno.Point(0, 0);

    /**
     * @memberof uno.Mouse
     * @member {uno.Point} _wheel - Current mouse wheel offset
     * @private
     */
    this._wheel = new uno.Point(0, 0);

    /**
     * @memberof uno.Mouse
     * @member {uno.MouseEvent} _event - Event for dispatching
     * @private
     */
    this._event = new uno.MouseEvent();

    this._initialize();
};

/**
 * Check is event type equal to any of {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @param {Number} [button] - Current button pressed
 * @returns {Boolean}
 */
uno.Mouse.prototype.any = function(event, button) {
    return (event.type === uno.Mouse.UP || event.type === uno.Mouse.DOWN || event.type === uno.Mouse.MOVE) &&
        (!button || event.button === button);
};

/**
 * Check is event type is {@link uno.Mouse.UP}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @param {Number} [button] - Current button pressed
 * @returns {Boolean}
 */
uno.Mouse.prototype.up = function(event, button) {
    return event.type === uno.Mouse.UP && (!button || event.button === button);
};

/**
 * Check is event type is {@link uno.Mouse.DOWN}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @param {Number} [button] - Current button pressed
 * @returns {Boolean}
 */
uno.Mouse.prototype.down = function(event, button) {
    return event.type === uno.Mouse.DOWN && (!button || event.button === button);
};

/**
 * Check is event type is {@link uno.Mouse.MOVE}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @param {Number} [button] - Current button pressed
 * @returns {Boolean}
 */
uno.Mouse.prototype.move = function(event, button) {
    return event.type === uno.Mouse.MOVE && (!button || event.button === button);
};

/**
 * Check is event type is {@link uno.Mouse.WHEEL}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Mouse.prototype.wheel = function(event) {
    return event.type === uno.Mouse.WHEEL;
};

/**
 * @memberof uno.Mouse
 * @member {Number} button - Current pressed mouse button<br>
 * Either uno.Mouse.NONE, uno.Mouse.LEFT, uno.Mouse.MIDDLE, uno.Mouse.RIGHT
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'button', {
    get: function () {
        return this._button;
    }
});

/**
 * @memberof uno.Mouse
 * @member {Number} x - The x-coordinate of the mouse pointer (in global space, not in render space)
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'x', {
    get: function () {
        return this._position.x;
    }
});

/**
 * @memberof uno.Mouse
 * @member {Number} y - The y-coordinate of the mouse pointer (in global space, not in render space)
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'y', {
    get: function () {
        return this._position.y;
    }
});

/**
 * @memberof uno.Mouse
 * @member {Number} wheelX - The x-offset of the mouse wheel
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'wheelX', {
    get: function () {
        return this._wheel.x;
    }
});

/**
 * @memberof uno.Mouse
 * @member {Number} wheelY - The y-offset of the mouse wheel
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'wheelY', {
    get: function () {
        return this._wheel.y;
    }
});

/**
 * Initialize mouse events
 * @private
 */
uno.Mouse.prototype._initialize = function() {
    if (uno.Browser.any) {
        window.addEventListener('mouseover', this._onOver.bind(this), true);
        window.addEventListener('mouseout', this._onOut.bind(this), true);
        window.addEventListener('mouseup', this._onUp.bind(this), true);
        window.addEventListener('mousedown', this._onDown.bind(this), true);
        window.addEventListener('mousemove', this._onMove.bind(this), true);

        // DOM3 Wheel Event: FF 17+, IE 9+, Chrome 31+, Safari 7+
        if ('onwheel' in window || (uno.Browser.ie && 'WheelEvent' in window))
            window.addEventListener('wheel', this._onWheel.bind(this), true);
        // Non-FF legacy: IE 6-9, Chrome 1-31, Safari 5-7.
        else if ('onmousewheel' in window)
            window.addEventListener('mousewheel', this._onWheel.bind(this), true);
        // FF prior to 17
        else if (uno.Browser.firefox && 'MouseScrollEvent' in window)
            window.addEventListener('MozMousePixelScroll', this._onWheel.bind(this), true);
    }
};

/**
 * Call input handler for all renders root objects
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}, {@link uno.Mouse.WHEEL}
 * @private
 */
uno.Mouse.prototype._callInput = function(type) {
    var renders = uno.Render.renders;
    var event = this._event;
    var prevent = false;
    for (var i = 0, l = renders.length; i < l; ++i) {
        var render = renders[i];
        var bounds = render.bounds;
        var pointer = this._position;
        if (render.root && bounds.contains(pointer)) {
            event._set(type, this._button, pointer.x - bounds.x, pointer.y - bounds.y, this._wheel.x, this._wheel.y);
            render.root.input(event, render);
            prevent = true;
        }
    }
    event._reset();
    return prevent;
};

/**
 * Mouse over callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onOver = function(e) {
    this._position.set(e.clientX, e.clientY);
};

/**
 * Mouse out callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onOut = function() {
    this._position.set(0, 0);
};

/**
 * Mouse down callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onDown = function(e) {
    this._position.set(e.clientX, e.clientY);
    this._button = Math.min(e.button + 1, 3);
    if (this._callInput(uno.Mouse.DOWN))
        e.preventDefault();
};

/**
 * Mouse up callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onUp = function(e) {
    this._position.set(e.clientX, e.clientY);
    this._button = Math.min(e.button + 1, 3);
    if (this._callInput(uno.Mouse.UP))
        e.preventDefault();
    this._button = uno.Mouse.NONE;
};

/**
 * Mouse move callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onMove = function(e) {
    this._position.set(e.clientX, e.clientY);
    if (this._callInput(uno.Mouse.MOVE))
        e.preventDefault();
};

/**
 * Mouse wheel callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onWheel = function(e) {
    if (e.deltaX !== undefined) {
        this._wheel.set(e.deltaX, e.deltaY);
        if (uno.Browser.firefox)
            this._wheel.multiply(40);
    } else if (e.wheelDeltaX !== undefined)
        this._wheel.set(-e.wheelDeltaX / 40, -e.wheelDeltaY / 40);
    else
        this._wheel.set(0, e.detail);
    if (this._callInput(uno.Mouse.WHEEL))
        e.preventDefault();
};

uno.Mouse = new uno.Mouse();

/**
 * No mouse button
 * @const
 * @type {Number}
 */
uno.Mouse.NONE = 0;

/**
 * Left mouse button
 * @const
 * @type {Number}
 */
uno.Mouse.LEFT = 1;

/**
 * Middle mouse button
 * @const
 * @type {Number}
 */
uno.Mouse.MIDDLE = 2;

/**
 * Right mouse button
 * @const
 * @type {Number}
 */
uno.Mouse.RIGHT = 3;

/**
 * Mouse up event type
 * @const
 * @type {Number}
 */
uno.Mouse.UP = 100;

/**
 * Mouse down event type
 * @const
 * @type {Number}
 */
uno.Mouse.DOWN = 101;

/**
 * Mouse move event type
 * @const
 * @type {Number}
 */
uno.Mouse.MOVE = 102;


/**
 * Mouse wheel event type
 * @const
 * @type {Number}
 */
uno.Mouse.WHEEL = 103;