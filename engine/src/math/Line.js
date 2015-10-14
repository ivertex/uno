/**
 * uno.Line class
 * @param {Number|uno.Point|uno.Line} [x1=0] - The x-coordinate of the first point of the line<br>
 * If x2 param is undefined x1 is treated as uno.Point instance<br>
 * If y1 param is undefined x1 is treated as uno.Line instance
 * @param {Number|uno.Point} [y1=0] - The y-coordinate of the first point of the line<br>
 * If x2 param is undefined x1 is treated as uno.Point instance
 * @param {Number} [x2=0] - The x-coordinate of the second point of the line
 * @param {Number} [y2=0] - The y-coordinate of the second point of the line
 * @constructor
 */
uno.Line = function(x1, y1, x2, y2) {
    /**
     * The x-coordinate of the first point of the line
     * @type {Number}
     * @default 0
     */
    this.x1 = 0;

    /**
     * The y-coordinate of the first point of the line
     * @type {Number}
     * @default 0
     */
    this.y1 = 0;

    /**
     * The x-coordinate of the second point of the line
     * @type {Number}
     * @default 0
     */
    this.x2 = 0;

    /**
     * The y-coordinate of the second point of the line
     * @type {Number}
     * @default 0
     */
    this.y2 = 0;

    if (x1 !== undefined)
        this.set(x1, y1, x2, y2);
};

/**
 * Clone the line and return copied instance
 * @returns {uno.Line} The line copy
 */
uno.Line.prototype.clone = function() {
    return new uno.Line(this.x1, this.y1, this.x2, this.y2);
};

/**
 * Set the line properties
 * @param {Number|uno.Point|uno.Line} [x1=0] - The x-coordinate of the first point of the line<br>
 *     If x1 param is object and have x1 property it treated as uno.Line instance<br>
 *     If x1 param is object and have x property it treated as uno.Point instance<br>
 * @param {Number|uno.Point} [y1=0] - The y-coordinate of the first point of the line<br>
 *     If y1 param is object and have x property it treated as uno.Point instance<br>
 * @param {Number} [x2=0] - The x-coordinate of the second point of the line
 * @param {Number} [y2=0] - The y-coordinate of the second point of the line
 * @return {uno.Line} <code>this</code>
 */
uno.Line.prototype.set = function(x1, y1, x2, y2) {
    if (x1 !== undefined && x1.x1 !== undefined) {
        this.x1 = x1.x1;
        this.y1 = x1.y1;
        this.x2 = x1.x2;
        this.y2 = x1.y2;
        return this;
    }
    if (x1 !== undefined && x1.x !== undefined) {
        this.x1 = x1.x;
        this.y1 = x1.y;
        this.x2 = y1.x;
        this.y2 = y1.y;
        return this;
    }
    this.x1 = x1 || 0;
    this.y1 = y1 || 0;
    this.x2 = x2 || 0;
    this.y2 = y2 || 0;
    return this;
};

/**
 * Is the line equal to given
 * @param {uno.Line} line - Line for comparison
 * @returns {Boolean}
 */
uno.Line.prototype.equal = function(line) {
    return line && this.x1 === line.x1 && this.y1 === line.y1 && this.x2 === line.x2 && this.y2 === line.y2;
};

/**
 * Is the line contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x param is object and have x property it treated as uno.Point instance<br>
 * @param {Number} y - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Line.prototype.contains = function(x, y) {
    if (x.x !== undefined)
        return x.x >= Math.min(this.x1, this.x2) && x.x <= Math.max(this.x1, this.x2) &&
            x.y >= Math.min(this.y1, this.y2) && x.y <= Math.max(this.y1, this.y2) &&
            ((x.x - this.x1) * (this.y2 - this.y1) === (this.x2 - this.x1) * (x.y - this.y1));
    return x >= Math.min(this.x1, this.x2) && x <= Math.max(this.x1, this.x2) &&
        y >= Math.min(this.y1, this.y2) && y <= Math.max(this.y1, this.y2) &&
        ((x - this.x1) * (this.y2 - this.y1) === (this.x2 - this.x1) * (y - this.y1));
};