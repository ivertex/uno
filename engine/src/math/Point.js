/**
 * uno.Point class
 * @param {Number|uno.Point} [x] - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @constructor
 */
uno.Point = function(x, y) {
    /**
     * The x-coordinate of the point
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the point
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    if (x !== undefined)
        this.set(x, y);
};

/**
 * Clone the point and return copied instance
 * @returns {uno.Point} The point copy
 */
uno.Point.prototype.clone = function() {
    return new uno.Point(this);
};

/**
 * Set point properties
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} <code>this</code>
 */
uno.Point.prototype.set = function(x, y) {
    if (x === undefined) {
        this.x = this.y = 0;
        return this;
    }
    if (x.x !== undefined) {
        this.x = x.x;
        this.y = x.y;
        return this;
    }
    this.x = x || 0;
    this.y = y === undefined ? this.x : y;
    return this;
};

/**
 * Adds the given x and y values
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.add = function(x, y) {
    if (x === undefined)
        return this;
    if (x.x !== undefined) {
        this.x += x.x;
        this.y += x.y;
        return this;
    }
    this.x += x;
    this.y += y === undefined ? x : y;
    return this;
};

/**
 * Subtracts the given x and y values
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.subtract = function(x, y) {
    if (x === undefined)
        return this;
    if (x.x !== undefined) {
        this.x -= x.x;
        this.y -= x.y;
        return this;
    }
    this.x -= x;
    this.y -= y === undefined ? x : y;
    return this;
};

/**
 * Multiplies the given x and y values
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.multiply = function(x, y) {
    if (x === undefined) {
        this.x = this.y = 0;
        return this;
    }
    if (x.x !== undefined) {
        this.x *= x.x;
        this.y *= x.y;
        return this;
    }
    this.x *= x;
    this.y *= y === undefined ? x : y;
    return this;
};

/**
 * Divides the given x and y values
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.divide = function(x, y) {
    if (x === undefined)
        return this;
    if (x.x !== undefined) {
        this.x /= x.x;
        this.y /= x.y;
        return this;
    }
    this.x /= x;
    this.y /= y === undefined ? x : y;
    return this;
};

/**
 * Normalize point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.normalize = function() {
    if (this.zero())
        return this;
    var l = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= l;
    this.y /= l;
    return this;
};

/**
 * Invert point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.invert = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
};

/**
 * Clamp point
 * @param {Number} from - Start clamp value
 * @param {Number} to - End clamp value
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.clamp = function(from, to) {
    if (this.x < from)
        this.x = from;
    else if (this.x > to)
        this.x = to;
    if (this.y < from)
        this.y = from;
    else if (this.y > to)
        this.y = to;
    return this;
};

/**
 * Returns the distance between this and given points<br>
 *     With no arguments distance from 0,0 returned
 * @param {Number|uno.Point} [x] - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {Number}
 */
uno.Point.prototype.distance = function(x, y) {
    if (x === undefined)
        return Math.sqrt(this.x * this.x + this.y * this.y);
    if (x.x !== undefined)
        return Math.sqrt((x.x - this.x) * (x.x - this.x) + (x.y - this.y) * (x.y - this.y));
    return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
};

/**
 * Returns the angle between this and given points
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {Number}
 */
uno.Point.prototype.angle = function(x, y) {
    if (x === undefined)
        return Math.atan2(-this.y, -this.x);
    if (x.x !== undefined)
        return Math.atan2(x.y - this.y, x.x - this.x);
    return Math.atan2(y - this.y, x - this.x);
};

/**
 * Is point is equal to given
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {Boolean}
 */
uno.Point.prototype.equal = function(x, y) {
    if (x === undefined || x === null)
        return false;
    if (x.x !== undefined)
        return this.x === x.x && this.y === x.y;
    return this.x === x && this.y === y;
};

/**
 * Is the point x and y coordinates equal zero
 * @returns {Boolean}
 */
uno.Point.prototype.zero = function() {
    return this.x === 0 && this.y === 0;
};