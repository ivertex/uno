/**
 * uno.Rect class
 * @param {Number|uno.Point|uno.Rect} [x=0] - The x-coordinate of the left-top point of the rect<br>
 *     If x param is object and have property width it treated as uno.Rect instance<br>
 *     If x param is object and have property x it treated as uno.Point instance (position of the rect)
 * @param {Number|uno.Point} [y=0] - The y-coordinate of the left-top point of the rect<br>
 *     If y param is object and have property x it treated as uno.Point instance (size of the rect)
 * @param {Number} [width=0] - The width of the rect
 * @param {Number} [height=0] - The height of the rect
 * @constructor
 */
uno.Rect = function(x, y, width, height) {
    /**
     * The x-coordinate of the left-top point of the rect
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the left-top point of the rect
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    /**
     * The width of the rect
     * @type {Number}
     * @default 0
     */
    this.width = 0;

    /**
     * The height of the rect
     * @type {Number}
     * @default 0
     */
    this.height = 0;

    if (x !== undefined)
        this.set(x, y, width, height);
};

/**
 * Clone the rect and return copied instance
 * @returns {uno.Rect} The rect copy
 */
uno.Rect.prototype.clone = function() {
    return new uno.Rect(this.x, this.y, this.width, this.height);
};

/**
 * Set the rect properties
 * @param {Number|uno.Point|uno.Rect} [x=0] - The x-coordinate of the left-top point of the rect<br>
 *     If x param is object and have property width it treated as uno.Rect instance<br>
 *     If x param is object and have property x it treated as uno.Point instance (left-top point)
 * @param {Number|uno.Point} [y=0] - The y-coordinate of the left-top point of the rect<br>
 *     If y param is object and have property x it treated as uno.Point instance (width-height)
 * @param {Number} [width=0] - The width of the rect
 * @param {Number} [height=0] - The height of the rect
 * @returns {uno.Rect} <code>this</code>
 */
uno.Rect.prototype.set = function(x, y, width, height) {
    if (x !== undefined) {
        if (x.width !== undefined) {
            this.x = x.x;
            this.y = x.y;
            this.width = x.width;
            this.height = x.height;
            return this;
        }
        if (x.x !== undefined) {
            this.x = x.x;
            this.y = x.y;
            this.width = y.x;
            this.height = y.y;
            return this;
        }
    }
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
    return this;
};

/**
 * Is the rect equal to given
 * @param {Number|uno.Rect} x - The x-coordinate of the left-top point of the rect<br>
 *     If x param is object and have property width it treated as uno.Rect instance
 * @param {Number} y - The y-coordinate of the left-top point of the rect
 * @param {Number} width - The width of the rect
 * @param {Number} height - The height of the rect
 * @returns {Boolean}
 */
uno.Rect.prototype.equal = function(x, y, width, height) {
    if (x === undefined || x === null)
        return false;
    if (x.width !== undefined)
        return this.x === x.x && this.y === x.y && this.width === x.width && this.height === x.height;
    return this.x === x && this.y === y && this.width === width && this.height === height;
};

/**
 * Is the rect contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Rect.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0)
        return false;
    if (x.x !== undefined)
        return this.x <= x.x && this.y <= x.y && this.x + this.width >= x.x && this.y + this.height >= x.y;
    return this.x <= x && this.y <= y && this.x + this.width >= x && this.y + this.height >= y;
};