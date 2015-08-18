/**
 * Mouse event class
 * @constructor
 */
uno.MouseEvent = function() {
    /**
     * Type of event<br>
     *     Either: {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}, {@link uno.Mouse.WHEEL}
     * @type {Number}
     * @private
     */
    this._type = 0;

    /**
     * Current pressed mouse button<br>
     *     Either {@link uno.Mouse.NONE}, {@link uno.Mouse.LEFT}, {@link uno.Mouse.MIDDLE}, {@link uno.Mouse.RIGHT}
     * @type {Number}
     * @private
     */
    this._button = 0;

    /**
     * Current mouse pointer position (in global space, not in render space)
     * @type {uno.Point}
     * @private
     */
    this._position = new uno.Point(0, 0);

    /**
     * Current mouse wheel offset
     * @type {uno.Point}
     * @private
     */
    this._wheel = new uno.Point(0, 0);
};

/**
 * @memberof uno.MouseEvent
 * @member {Number} type - Type of event<br>
 *     Either: {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}, {@link uno.Mouse.WHEEL}
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'type', {
    get: function () {
        return this._type;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} button - Current pressed mouse button<br>
 *     Either {@link uno.Mouse.NONE}, {@link uno.Mouse.LEFT}, {@link uno.Mouse.MIDDLE}, {@link uno.Mouse.RIGHT}
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'button', {
    get: function () {
        return this._button;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} x - The x-coordinate of the mouse pointer in render space
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'x', {
    get: function () {
        return this._position.x;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} y - The y-coordinate of the mouse pointer in render space
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'y', {
    get: function () {
        return this._position.y;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} wheelX - The x offset of the mouse wheel
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'wheelX', {
    get: function () {
        return this._wheel.x;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} wheelY - The y offset of the mouse wheel
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'wheelY', {
    get: function () {
        return this._wheel.y;
    }
});

/**
 * Set event params
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}, {@link uno.Mouse.WHEEL}
 * @param {Number} x - The x-coordinate of the mouse pointer in render space
 * @param {Number} y - The y-coordinate of the mouse pointer in render space
 * @param {Number} button - Current pressed mouse button<br>
 *     Either {@link uno.Mouse.NONE}, {@link uno.Mouse.LEFT}, {@link uno.Mouse.MIDDLE}, {@link uno.Mouse.RIGHT}
 * @param {Number} wheelX - The x offset of the mouse wheel
 * @param {Number} wheelY - The y offset of the mouse wheel
 * @private
 */
uno.MouseEvent.prototype._set = function(type, button, x, y, wheelX, wheelY) {
    this._type = type;
    this._button = button;
    this._position.set(x, y);
    this._wheel.set(wheelX, wheelY);
};

/**
 * Reset event params
 * @private
 */
uno.MouseEvent.prototype._reset = function() {
    this._type = 0;
    this._button = 0;
    this._position.set(0, 0);
    this._wheel.set(0, 0);
};