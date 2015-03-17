/**
 * Touch event class
 * @constructor
 */
uno.TouchEvent = function() {
    /**
     * Type of event<br>
     *     Either: {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
     * @type {Number}
     * @private
     */
    this._type = 0;

    /**
     * Current touch points (positions in render space)
     * @type {uno.TouchList}
     * @private
     */
    this._points = new uno.TouchList();
};

/**
 * Type of event<br>
 *     Either: {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
 * @name uno.TouchEvent#type
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchEvent.prototype, 'type', {
    get: function () {
        return this._type;
    }
});

/**
 * List of touch points
 * @name uno.TouchEvent#points
 * @type {uno.TouchList}
 * @readonly
 */
Object.defineProperty(uno.TouchEvent.prototype, 'points', {
    get: function () {
        return this._points;
    }
});

/**
 * Set event
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
 * @param {uno.Rect} bounds - Render bounds for calc coordinates in render space
 * @param {uno.TouchList} points - Touch point list
 * @private
 */
uno.TouchEvent.prototype._set = function(type, bounds, points) {
    this._type = type;
    var localPoints = this._points;
    var item, j = 0;
    localPoints._resize(points.length);
    for (var i = 0, l = points.length; i < l; ++i) {
        item = points.item(i);
        if (bounds.contains(item))
            localPoints.item(i - j)._set(item.id, item.x - bounds.x, item.y - bounds.y);
        else
            j++;
    }
    if (j)
        localPoints._resize(localPoints.length - j);
};

/**
 * Reset touch event params
 * @private
 */
uno.TouchEvent.prototype._reset = function() {
    this._type = 0;
    this._points._resize(0);
};