/**
 * Touch list class
 * @constructor
 */
uno.TouchList = function() {
    /**
     * List of touch points
     * @type {uno.TouchPoint[]}
     * @private
     */
    this._points = [];

    /**
     * Pool for touch points
     * @type {Array}
     * @private
     */
    this._pool = [];
};

/**
 * Count of touch points
 * @name uno.TouchList#length
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchList.prototype, 'length', {
    get: function () {
        return this._points.length;
    }
});

/**
 * Get touch point by index
 * @param {Number} index - Index of the touch point
 * @returns {uno.TouchPoint}
 */
uno.TouchList.prototype.item = function(index) {
    if (index === undefined)
        index = 0;
    if (index >= 0 && index < this._points.length)
        return this._points[index];
    return undefined;
};

/**
 * Resize touch points list before update
 * @param {Number} length - New length of the list
 * @private
 */
uno.TouchList.prototype._resize = function(length) {
    var points = this._points;
    var pool = this._pool;
    var i;
    if (points.length === length)
        return;
    if (length < points.length) {
        i = length === 0 ? points.length : points.length - length;
        var returned = points.splice(0, i);
        while (i--)
            pool.push(returned[i]);
        return;
    }
    i = length - points.length;
    while (i--) {
        if (pool.length)
            points.push(pool.pop());
        else
            points.push(new uno.TouchPoint());
    }
};