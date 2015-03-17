/**
 * uno.Arc class
 * @param {Number|uno.Arc} [x=0] - The x-coordinate of the center of the arc<br>
 *     If x is object it treated as uno.Arc instance
 * @param {Number} [y=0] - The y-coordinate of the center of the arc
 * @param {Number} [radius=0] - The radius of the arc
 * @param {Number} [startAngle=0] - The starting angle, in radians
 * @param {Number} [endAngle=uno.Math.TWO_PI] - The ending angle, in radians
 * @param {Boolean} [antiClockwise=false] - Specifies whether the drawing should be counterclockwise or clockwise
 * @constructor
 */
uno.Arc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    /**
     * The x-coordinate of the center of the arc
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the center of the arc
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    /**
     * The radius of the arc
     * @type {Number}
     * @default 0
     */
    this.radius = 0;

    /**
     * The starting angle, in radians
     * @type {Number}
     * @default 0
     */
    this.startAngle = 0;

    /**
     * The ending angle, in radians
     * @type {Number}
     * @default 0
     */
    this.endAngle = 0;

    /**
     * Specifies whether the drawing should be counterclockwise or clockwise
     * @type {Boolean}
     * @default false
     */
    this.antiClockwise = false;

    if (x !== undefined)
        this.set(x, y, radius, startAngle, endAngle, antiClockwise);
};

/**
 * Clone the arc and return copied instance
 * @returns {uno.Arc} The arc copy
 */
uno.Arc.prototype.clone = function() {
    return new uno.Arc(this);
};

/**
 * Set arc properties
 * @param {Number|uno.Arc} x - The x-coordinate of the center of the arc<br>
 *     If x is object it treated as uno.Arc instance
 * @param {Number} [y=0] - The y-coordinate of the center of the arc
 * @param {Number} [radius=0] - The radius of the arc
 * @param {Number} [startAngle=0] - The starting angle, in radians
 * @param {Number} [endAngle=uno.Math.TWO_PI] - The ending angle, in radians
 * @param {Boolean} [antiClockwise=false] - Specifies whether the drawing should be counterclockwise or clockwise
 * @return {uno.Arc} <code>this</code>
 */
uno.Arc.prototype.set = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    if (x !== undefined && x.x !== undefined) {
        this.x = x.x;
        this.y = x.y;
        this.radius = x.radius;
        this.startAngle = x.startAngle;
        this.endAngle = x.endAngle;
        this.antiClockwise = x.antiClockwise;
        return this;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius || 0;
    this.startAngle = startAngle || 0;
    this.endAngle = endAngle || uno.Math.TWO_PI;
    this.antiClockwise = antiClockwise || false;
    return this;
};

/**
 * Is the arc equal to given
 * @param {uno.Arc} arc - Arc for comparison
 * @returns {Boolean}
 */
uno.Arc.prototype.equal = function(arc) {
    return this.x === arc.x && this.y === arc.y && this.radius === arc.radius &&
        this.startAngle === arc.startAngle && this.endAngle === arc.endAngle &&
        this.antiClockwise === arc.antiClockwise;
};

/**
 * Is the arc contains point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Arc instance
 * @param {Number} y - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Arc.prototype.contains = function(x, y) {
    if (this.radius <= 0)
        return false;
    if (x.x !== undefined)
        return (this.x - x.x) * (this.x - x.x) + (this.y - x.y) * (this.y - x.y) <= this.radius * this.radius;
    return (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y) <= this.radius * this.radius;
};