/**
 * Class for hold and calculate UV coordinates
 * @constructor
 */
uno.UV = function() {
    /**
     * The left-top point x-coordinate
     * @type {Number}
     * @defult 0
     */
    this.x0 = 0;

    /**
     * The left-top point y-coordinate
     * @type {Number}
     * @defult 0
     */
    this.y0 = 0;

    /**
     * The right-top point x-coordinate
     * @type {Number}
     * @defult 0
     */
    this.x1 = 0;

    /**
     * The right-top point y-coordinate
     * @type {Number}
     * @defult 0
     */
    this.y1 = 0;

    /**
     * The right-bottom point x-coordinate
     * @type {Number}
     * @defult 0
     */
    this.x2 = 0;

    /**
     * The right-bottom point y-coordinate
     * @type {Number}
     * @defult 0
     */
    this.y2 = 0;

    /**
     * The left-bottom point x-coordinate
     * @type {Number}
     * @defult 0
     */
    this.x3 = 0;

    /**
     * The left-bottom point y-coordinate
     * @type {Number}
     * @defult 0
     */
    this.y3 = 0;
};

/**
 * Update UV coordinates using max size and frame data
 * @param {Number} maxWidth - The max width (texture width)
 * @param {Number} maxHeight - The max height (texture height)
 * @param {Number} x - The x-coordinate of the frame
 * @param {Number} y - The y-coordinate of the frame
 * @param {Number} width - The width of the frame
 * @param {Number} height - The height of the frame
 * @returns {uno.UV} - <code>this</code>
 */
uno.UV.prototype.update = function(maxWidth, maxHeight, x, y, width, height) {
    this.x0 = x / maxWidth;
    this.y0 = y / maxHeight;
    this.x1 = (x + width) / maxWidth;
    this.y1 = y / maxHeight;
    this.x2 = (x + width) / maxWidth;
    this.y2 = (y + height) / maxHeight;
    this.x3 = x / maxWidth;
    this.y3 = (y + height) / maxHeight;
    return this;
};