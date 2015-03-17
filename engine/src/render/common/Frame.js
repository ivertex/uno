/**
 * Frame represents rectangle of texture
 * @param {Number} maxWidth - Width limit of the frame (width of the texture)<br>
 *     If maxWidth is object and have x property it treated as uno.Point (max size of the frame)
 * @param {Number} maxHeight - Height limit of the frame (height of the texture)
 * @constructor
 */
uno.Frame = function(maxWidth, maxHeight) {
    /**
     * @property {Number} _x - X-coordinate of the rect
     * @private
     * @default 0
     */
    this._x = 0;

    /**
     * @property {Number} _y - Y-coordinate of the rect
     * @private
     * @default 0
     */
    this._y = 0;

    /**
     * @property {Number} _width - Width the rect
     * @private
     * @default 0
     */
    this._width = maxWidth || 0;

    /**
     * @property {Number} _height - Height the rect
     * @private
     * @default 0
     */

    this._height = maxHeight || 0;
    /**
     * @property {Number} _maxWidth - Max width of the rect (width of texture)
     * @private
     * @default 0
     */

    this._maxWidth = maxWidth || 0;
    /**
     * @property {Number} _maxHeight - Height the rect (height of texture)
     * @private
     * @default 0
     */
    this._maxHeight = maxHeight || 0;

    /**
     * @property {Boolean} _dirty - Mark UV as dirty when coordinates or size changed
     * @private
     * @default true
     */
    this._dirty = true;

    /**
     * @property {uno.UV} _uv - UV coordinates of the rect
     * @private
     * @default null
     */
    this._uv = null;

    if (maxWidth !== undefined && maxWidth.x !== undefined) {
        this._maxWidth = this._width = maxWidth.x;
        this._maxHeight = this._height = maxWidth.y;
    }
};

/**
 * Set frame position and size
 * @param {Number|uno.Point|uno.Rect|uno.Frame} [x=0] - The new x-coordinate of the frame<br>
 *     If x is object and have no width property it treated as uno.Point (position of the frame)
 *     If x is object and have width property it treated as uno.Rect or uno.Frame (they have equal properties)
 * @param {Number|uno.Point} [y=0] - The new y-coordinate of the frame
 *     If y is object and have no width property it treated as uno.Point (size of the frame)
 * @param {Number} [width=0] - The new width of the frame
 * @param {Number} [height=0] - The new height of the frame
 * @returns {uno.Frame} - <code>this</code>
 */
uno.Frame.prototype.set = function(x, y, width, height) {
    if (x !== undefined && x.width !== undefined) {
        if (x.x < 0 || x.x + x.width > this._maxWidth ||
            x.y < 0 || x.y + x.height > this._maxHeight)
            return this;
        this._x = x.x;
        this._y = x.y;
        this._width = x.width;
        this._height = x.height;
        if (x.maxWidth) {
            this._maxWidth = x.maxWidth;
            this._maxHeight = x.maxHeight;
        }
        this._dirty = true;
        return this;
    }
    if (x !== undefined && x.x !== undefined) {
        if (x.x >= 0 && x.y >= 0) {
            this._x = x.x;
            this._y = x.y;
        }
        if (y !== undefined && y.x !== undefined) {
            if (this.x + y.x <= this._maxWidth && this.y + y.y <= this._maxHeight) {
                this._width = y.x;
                this._height = y.y;
            }
        }
        return this;
    }
    if (x < 0 || x + width > this._maxWidth ||
        y < 0 || y + height > this._maxHeight)
        return this;
    this._x = x || 0;
    this._y = y || 0;
    this._width = width || 0;
    this._height = height || 0;
    this._dirty = true;
    return this;
};

/**
 * Set frame position
 * @param {Number|uno.Point} x - The x-coordinate of the frame<br>
 *     If x is object and have x property it treated as uno.Point (position of the frame)
 * @param {Number} y - The y-coordinate of the frame
 * @returns {uno.Frame} - <code>this</code>
 */
uno.Frame.prototype.setPosition = function(x, y) {
    if (x.x !== undefined) {
        x = x.x;
        y = x.y;
    }
    if (x < 0 || x + this._width > this._maxWidth ||
        y < 0 || y + this._height > this._maxHeight)
        return this;
    this._x = x;
    this._y = y;
    this._dirty = true;
    return this;
};

/**
 * Set frame position
 * @param {Number|uno.Point} width - The width of the frame<br>
 *     If x is object and have x property it treated as uno.Point (size of the frame)
 * @param {Number} height - The height of the frame
 * @returns {uno.Frame} - <code>this</code>
 */
uno.Frame.prototype.setSize = function(width, height) {
    if (width !== undefined && width.x !== undefined) {
        width = width.x;
        height = width.y;
    }
    if (width < 0 || this._x + width > this._maxWidth ||
        height < 0 || this._y + height > this._maxHeight)
        return this;
    this._width = width;
    this._height = height;
    this._dirty = true;
    return this;
};

/**
 * Set frame max size
 * @param {Number|uno.Point} width - The max width of the frame<br>
 *     If x is object and have x property it treated as uno.Point (max size of the frame)
 * @param {Number} height - The max height of the frame
 * @returns {uno.Frame} - <code>this</code>
 */
uno.Frame.prototype.setMaxSize = function(width, height) {
    if (width !== undefined && width.x !== undefined) {
        width = width.x;
        height = width.y;
    }
    this._maxWidth = width;
    this._maxHeight = height;
    if (this._x > this._maxWidth)
        this._x = this._maxWidth;
    if (this._y > this._maxHeight)
        this._y = this._maxHeight;
    if (this._x + this._width > this._maxWidth)
        this._width = this._maxWidth - this._x;
    if (this._y + this._height > this._maxHeight)
        this._height = this._maxHeight - this._y;
    this._dirty = true;
    return this;
};

/**
 * The x-coordinate of the frame
 * @name uno.Frame#x
 * @type {Number}
 * @default 0
 */
Object.defineProperty(uno.Frame.prototype, 'x', {
    get: function() {
        return this._x;
    },
    set: function(value) {
        if (value < 0 || value + this._width > this._maxWidth)
            return;
        this._x = value;
    }
});

/**
 * The y-coordinate of the frame
 * @name uno.Frame#y
 * @type {Number}
 * @default 0
 */
Object.defineProperty(uno.Frame.prototype, 'y', {
    get: function() {
        return this._y;
    },
    set: function(value) {
        if (value < 0 || value + this._height > this._maxHeight)
            return;
        this._y = value;
    }
});

/**
 * The width of the frame
 * @name uno.Frame#width
 * @type {Number}
 * @default 0
 */
Object.defineProperty(uno.Frame.prototype, 'width', {
    get: function() {
        return this._width;
    },
    set: function(value) {
        if (value < 0 || this._x + value > this._maxWidth)
            return;
        this._width = value;
    }
});

/**
 * The height of the frame
 * @name uno.Frame#height
 * @type {Number}
 * @default 0
 */
Object.defineProperty(uno.Frame.prototype, 'height', {
    get: function() {
        return this._height;
    },
    set: function(value) {
        if (value < 0 || this._y + value > this._maxHeight)
            return;
        this._height = value;
    }
});

/**
 * The max width of the frame (texture width)
 * @name uno.Frame#maxWidth
 * @type {Number}
 * @default 0
 */
Object.defineProperty(uno.Frame.prototype, 'maxWidth', {
    get: function() {
        return this._maxWidth;
    }
});

/**
 * The max height of the frame (texture height)
 * @name uno.Frame#maxHeight
 * @type {Number}
 * @default 0
 */
Object.defineProperty(uno.Frame.prototype, 'maxHeight', {
    get: function() {
        return this._maxHeight;
    }
});

/**
 * The UV coordinates for the frame
 * @name uno.Frame#uv
 * @type {uno.UV}
 * @readonly
 */
Object.defineProperty(uno.Frame.prototype, 'uv', {
    get: function() {
        if (!this._uv)
            this._uv = new uno.UV();
        if (this._dirty) {
            this._uv.update(this._maxWidth, this._maxHeight, this._x, this._y, this._width, this._height);
            this._dirty = false;
        }
        return this._uv;
    }
});