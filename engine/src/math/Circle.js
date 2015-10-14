/**
 * uno.Circle class
 * @param {Number|uno.Circle} [x=0] - The x-coordinate of the center of the circle<br>
 *     If x is object it treated as uno.Circle instance
 * @param {Number} [y=0] - The y-coordinate of the center of the circle
 * @param {Number} [radius=0] - The radius of the circle
 * @constructor
 */
uno.Circle = function(x, y, radius) {
    /**
     * The x-coordinate of the center of the circle
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the center of the circle
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    /**
     * The radius of the circle
     * @type {Number}
     * @default 0
     */
    this.radius = 0;

    if (x !== undefined)
        this.set(x, y, radius);
};

/**
 * Clone the circle and return copied instance
 * @returns {uno.Circle} The circle copy
 */
uno.Circle.prototype.clone = function() {
    return new uno.Circle(this);
};

/**
 * Set the circle properties
 * @param {Number|uno.Circle} x - The x-coordinate of the center of the circle<br>
 *     If x is object it treated as uno.Circle instance
 * @param {Number} [y=0] - The y-coordinate of the center of the circle
 * @param {Number} [radius=0] - The radius of the circle
 * @return {uno.Circle} <code>this</code>
 */
uno.Circle.prototype.set = function(x, y, radius) {
    if (x !== undefined && x.x !== undefined) {
        this.x = x.x;
        this.y = x.y;
        this.radius = x.radius;
        return this;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius || 0;
    return this;
};

/**
 * Is the circle equal to given
 * @param {uno.Circle} circle - Circle for comparison
 * @returns {Boolean}
 */
uno.Circle.prototype.equal = function(circle) {
    return circle && this.x === circle.x && this.y === circle.y && this.radius === circle.radius;
};

/**
 * Is the circle contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Circle instance
 * @param {Number} [y] - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Circle.prototype.contains = function(x, y) {
    if (this.radius <= 0)
        return false;
    if (x.x !== undefined)
        return (this.x - x.x) * (this.x - x.x) + (this.y - x.y) * (this.y - x.y) <= this.radius * this.radius;
    return (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y) <= this.radius * this.radius;
};