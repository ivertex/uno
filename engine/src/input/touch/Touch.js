/**
 * Touch is responsible for handling all aspects of touch interaction
 * @namespace
 */
uno.Touch = function() {
    /**
     * @memberof uno.Touch
     * @member {uno.TouchList} _points - Current touch points (positions in global space, not in render space)
     * @private
     */
    this._points = new uno.TouchList();

    /**
     * @memberof uno.Touch
     * @member {uno.TouchEvent} _event - Event for dispatching
     * @private
     */
    this._event = new uno.TouchEvent();

    this._initialize();
};

/**
 * Check is event type equal to any of {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Touch.prototype.any = function(event) {
    return event.type === uno.Touch.UP || event.type === uno.Touch.DOWN || event.type === uno.Touch.MOVE;
};

/**
 * Check is event type is {@link uno.Touch.UP}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Touch.prototype.up = function(event) {
    return event.type === uno.Touch.UP;
};

/**
 * Check is event type is {@link uno.Touch.DOWN}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Touch.prototype.down = function(event) {
    return event.type === uno.Touch.DOWN;
};

/**
 * Check is event type is {@link uno.Touch.MOVE}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Touch.prototype.move = function(event) {
    return event.type === uno.Touch.MOVE;
};

/**
 * Initialize touch events
 * @private
 */
uno.Touch.prototype._initialize = function() {
    if (uno.Browser.any) {
        if ('ontouchstart' in document.documentElement) {
            window.addEventListener('touchstart', this._onTouchStart.bind(this), true);
            window.addEventListener('touchend', this._onTouchEnd.bind(this), true);
            window.addEventListener('touchmove', this._onTouchMove.bind(this), true);
            window.addEventListener('touchleave', this._onTouchLeave.bind(this), true);
            window.addEventListener('touchcancel', this._onTouchCancel.bind(this), true);
        } else
        // For IE 11
        if (window.PointerEvent) {
            window.addEventListener('pointerdown', this._onPointerDown.bind(this), true);
            window.addEventListener('pointermove', this._onPointerMove.bind(this), true);
            window.addEventListener('pointerup', this._onPointerUp.bind(this), true);
        } else
        // For IE 10
        if (window.MSPointerEvent) {
            window.addEventListener('MSPointerDown', this._onPointerDown.bind(this), true);
            window.addEventListener('MSPointerMove', this._onPointerMove.bind(this), true);
            window.addEventListener('MSPointerUp', this._onPointerUp.bind(this), true);
        }
    }
};

/**
 * Update touch points
 * @param {TouchEvent} e - Event to process
 * @private
 */
uno.Touch.prototype._updateTouch = function(e) {
    var touches = e.touches;
    var points = this._points;
    var item;
    points._resize(touches.length);
    for (var i = 0, l = touches.length; i < l; ++i) {
        item = touches.item(i);
        points.item(i)._set(item.identifier, item.clientX, item.clientY);
    }
};

/**
 * Call input handler for all renders root objects
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
 * @private
 */
uno.Touch.prototype._callInput = function(type) {
    var renders = uno.Render.renders;
    var event = this._event;
    var prevent = false;
    for (var i in renders) {
        var render = renders[i];
        if (!render.root)
            continue;
        event._set(type, render.bounds, this._points);
        if (event.points.length) {
            render.root.input(event, render);
            prevent = true;
        }
    }
    event._reset();
    return prevent;
};

/**
 * Pointer down callback
 * @param {PointerEvent} e - Pointer event
 * @private
 */
uno.Touch.prototype._onPointerDown = function(e) {
    if (e.pointerType !== undefined && e.pointerType !== 'touch')
        return;
    var points = this._points;
    points._resize(points.length + 1);
    points.item(points.length - 1)._set(e.pointerId, e.clientX, e.clientY);
    if (this._callInput(uno.Touch.DOWN))
        e.preventDefault();
};

/**
 * Pointer up callback
 * @param {PointerEvent} e - Pointer event
 * @private
 */
uno.Touch.prototype._onPointerUp = function(e) {
    if (e.pointerType !== undefined && e.pointerType !== 'touch')
        return;
    var points = this._points;
    for (var i = 0, l = points.length - 1; i < l; ++i) {
        var point = points.item(i);
        points.item(i)._set(point.id, point.x, point.y);
    }
    points._resize(points.length - 1);
    if (this._callInput(uno.Touch.UP))
        e.preventDefault();
};

/**
 * Pointer move callback
 * @param {PointerEvent} e - Pointer event
 * @private
 */
uno.Touch.prototype._onPointerMove = function(e) {
    if (e.pointerType !== undefined && e.pointerType !== 'touch')
        return;
    var points = this._points;
    for (var i = 0, l = points.length; i < l; ++i) {
        var point = points.item(i);
        if (point.id === e.pointerId) {
            point._set(point.id, e.clientX, e.clientY);
            break;
        }
    }
    if (this._callInput(uno.Touch.MOVE))
        e.preventDefault();
};

/**
 * Touch start callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchStart = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.DOWN))
        e.preventDefault();
};

/**
 * Touch end callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchEnd = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.UP))
        e.preventDefault();
};

/**
 * Touch move callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchMove = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.MOVE))
        e.preventDefault();
};

/**
 * Touch leave callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchLeave = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.UP))
        e.preventDefault();
};

/**
 * Touch cancel callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchCancel = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.UP))
        e.preventDefault();
};

uno.Touch = new uno.Touch();

/**
 * Touch up event type
 * @const
 * @type {Number}
 */
uno.Touch.UP = 300;

/**
 * Touch down event type
 * @const
 * @type {Number}
 */
uno.Touch.DOWN = 301;

/**
 * Touch move event type
 * @const
 * @type {Number}
 */
uno.Touch.MOVE = 302;