/**
 * uno.Ellipse class
 * @param {Number|uno.Ellipse} [x=0] - The x-coordinate of the center of the ellipse<br>
 *     If x is object it treated as uno.Ellipse instance
 * @param {Number} [y=0] - The y-coordinate of the center of the ellipse
 * @param {Number} [width=0] - The width of the ellipse
 * @param {Number} [height=0] - The height of the ellipse
 * @constructor
 */
uno.Ellipse = function(x, y, width, height) {
    /**
     * The x-coordinate of the center of the ellipse
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the center of the ellipse
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    /**
     * The width of the ellipse
     * @type {Number}
     * @default 0
     */
    this.width = 0;

    /**
     * The height of the ellipse
     * @type {Number}
     * @default 0
     */
    this.height = 0;

    if (x !== undefined)
        this.set(x, y, width, height);
};

/**
 * Clone the ellipse and return copied instance
 * @returns {uno.Ellipse} The ellipse copy
 */
uno.Ellipse.prototype.clone = function() {
    return new uno.Ellipse(this);
};

/**
 * Set the ellipse properties
 * @param {Number|uno.Rect|uno.Ellipse} x - The x-coordinate of the center of the ellipse<br>
 *     If x param is object and have property width it treated as uno.Ellipse or uno.Rect instance<br>
 *     If x param is object and have property x it treated as uno.Point instance (center point)
 * @param {Number} [y=0] - The y-coordinate of the center of the ellipse<br>
 *     If y param is object and have property x it treated as uno.Point instance (width and height)
 * @param {Number} [width=0] - The width of the ellipse
 * @param {Number} [height=0] - The height of the ellipse
 * @return {uno.Ellipse} <code>this</code>
 */
uno.Ellipse.prototype.set = function(x, y, width, height) {
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
 * Is the ellipse equal to given
 * @param {uno.Ellipse|uno.Circle} ellipse - Ellipse or circle for comparison
 * @returns {Boolean}
 */
uno.Ellipse.prototype.equal = function(ellipse) {
    if (ellipse.radius)
        return this.x === ellipse.x && this.y === ellipse.y && this.width === ellipse.radius && this.height === ellipse.radius;
    return this.x === ellipse.x && this.y === ellipse.y && this.width === ellipse.width && this.height === ellipse.height;
};

/**
 * Is the ellipse contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} y - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Ellipse.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0)
        return false;
    if (x.x !== undefined)
        return ((x.x - this.x) / this.width) * ((x.x - this.x) / this.width) + ((x.y - this.y) / this.height) * ((x.y - this.y) / this.height) <= 1;
    return ((x - this.x) / this.width) * ((x - this.x) / this.width) + ((y - this.y) / this.height) * ((y - this.y) / this.height) <= 1;
};