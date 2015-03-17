/**
 * Touch point class
 * @constructor
 */
uno.TouchPoint = function() {
    /**
     * Touch point identifier
     * @type {number}
     * @private
     */
    this._id = 0;

    /**
     * Touch point position
     * @type {uno.Point}
     * @private
     */
    this._position = new uno.Point(0, 0);

    // TODO: Add additional touch info
};

/**
 * Identifier of the touch point
 * @name uno.TouchPoint#id
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchPoint.prototype, 'id', {
    get: function () {
        return this._id;
    }
});

/**
 * The x-coordinate of the touch position
 * @name uno.TouchPoint#x
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchPoint.prototype, 'x', {
    get: function () {
        return this._position.x;
    }
});

/**
 * The y-coordinate of the touch position
 * @name uno.TouchPoint#y
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchPoint.prototype, 'y', {
    get: function () {
        return this._position.y;
    }
});

/**
 * Set touch point
 * @param {Number} id - Identifier of the touch point
 * @param {Number} x - The x-coordinate of the touch position
 * @param {Number} y - The y-coordinate of the touch position
 * @private
 */
uno.TouchPoint.prototype._set = function(id, x, y) {
    this._id = id;
    this._position.set(x, y);
};

/**
 * Reset touch point
 * @private
 */
uno.TouchPoint.prototype._reset = function() {
    this._id = 0;
    this._position.set(0, 0);
};