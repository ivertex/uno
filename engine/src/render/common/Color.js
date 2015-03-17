/**
 * uno.Color class holds color data
 * @param {Number|uno.Color} [r=1] - The red value of the color.<br>
 *     If g is undefined then r treated as color hex value (if r is Number) or uno.Color to copy
 * @param {Number} [g=1] - The green value of the color
 * @param {Number} [b=1] - The blue value of the color
 * @param {Number} [a=1] - The alpha value of the color
 * @constructor
 */
uno.Color = function(r, g, b, a) {
    /**
     * The red value of the color
     * @type {Number}
     * @private
     */
    this._r = 1;

    /**
     * The green value of the color
     * @type {Number}
     * @private
     */
    this._g = 1;

    /**
     * The blue value of the color
     * @type {Number}
     * @private
     */
    this._b = 1;

    /**
     * The alpha value of the color
     * @type {Number}
     * @private
     */
    this._a = 1;

    /**
     * Is cached values is dirty
     * @type {Boolean}
     * @private
     */
    this._dirty = true;

    /**
     * Cached hex value
     * @type {Number}
     * @private
     */
    this._hex = 0;

    /**
     * Cached CSS hex value
     * @type {String}
     * @private
     */
    this._cssHex = '';

    /**
     * Cached CSS RGBA value
     * @type {string}
     * @private
     */
    this._cssRGBA = '';

    /**
     * Cached packed ABGR value (one unsigned int with alpha, blue, green and red values in bytes)
     * @type {number}
     * @private
     */
    this._packedABGR = 0;

    this.set(r, g, b, a);
};

/**
 * Set color properties
 * @param {Number|uno.Color} [r=1] - The red value of the color.<br>
 *     If g is undefined then r treated as color hex value (if r is Number) or uno.Color to copy
 * @param {Number} [g=1] - The green value of the color
 * @param {Number} [b=1] - The blue value of the color
 * @param {Number} [a=1] - The alpha value of the color
 * @returns {uno.Color} - <code>this</code>
 */
uno.Color.prototype.set = function(r, g, b, a) {
    if (r !== undefined && g === undefined) {
        if (r.r !== undefined) {
            this._r = r.r;
            this._g = r.g;
            this._b = r.b;
            this._a = r.a;
            this._dirty = true;
            return this;
        }
        this.hex = r;
        this._dirty = true;
        return this;
    }
    this.r = r === undefined ? 1 : r;
    this.g = g === undefined ? 1 : g;
    this.b = b === undefined ? 1 : b;
    this.a = a === undefined ? 1 : a;
    this._dirty = true;
    return this;
};

/**
 * Is the color equal to given
 * @param {Number|uno.Color} r - The red value of the color.<br>
 *     If g is undefined then r treated as color hex value (if r is Number) or uno.Color
 * @param {Number} g - The green value of the color
 * @param {Number} b - The blue value of the color
 * @param {Number} a - The alpha value of the color
 * @returns {Boolean}
 */
uno.Color.prototype.equal = function(r, g, b, a) {
    if (g === undefined) {
        if (r.r !== undefined)
            return this._r === r.r && this._g === r.g && this._b === r.b && this._a === r.a;
        return this.hex === r;
    }
    return this._r === r && this._g === g && this._b === b && this._a === a;
};

/**
 * Clone the color and return copied instance
 * @returns {uno.Color} - The color copy
 */
uno.Color.prototype.clone = function() {
    return new uno.Color(this);
};

/**
 * Quantize color values
 * @param {Number} count - The values count to quantize
 * @returns {uno.Color} - <code>this</code>
 */
uno.Color.prototype.quantize = function(count) {
    this._r = Math.round(this._r * count) / count;
    this._g = Math.round(this._g * count) / count;
    this._b = Math.round(this._b * count) / count;
    this._dirty = true;
    return this;
};

/**
 * The R value of the color
 * @name uno.Color#r
 * @type {Number}
 * @default 1
 */
Object.defineProperty(uno.Color.prototype, 'r', {
    get: function() {
        return this._r;
    },
    set: function(value) {
        if (value === undefined || this._r === value)
            return;
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        this._r = value;
        this._dirty = true;
    }
});

/**
 * The G value of the color
 * @name uno.Color#g
 * @type {Number}
 * @default 1
 */
Object.defineProperty(uno.Color.prototype, 'g', {
    get: function() {
        return this._g;
    },
    set: function(value) {
        if (value === undefined || this._g === value)
            return;
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        this._g = value;
        this._dirty = true;
    }
});

/**
 * The B value of the color
 * @name uno.Color#b
 * @type {Number}
 * @default 1
 */
Object.defineProperty(uno.Color.prototype, 'b', {
    get: function() {
        return this._b;
    },
    set: function(value) {
        if (value === undefined || this._b === value)
            return;
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        this._b = value;
        this._dirty = true;
    }
});

/**
 * The A value of the color
 * @name uno.Color#a
 * @type {Number}
 * @default 1
 */
Object.defineProperty(uno.Color.prototype, 'a', {
    get: function() {
        return this._a;
    },
    set: function(value) {
        if (value === undefined || this._a === value)
            return;
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        this._a = value;
        this._dirty = true;
    }
});

/**
 * The hex representation of the color
 * @name uno.Color#hex
 * @type {Number}
 * @default 0xFFFFFF
 */
Object.defineProperty(uno.Color.prototype, 'hex', {
    get: function() {
        if (this._dirty)
            this._hex = (this._r * 255 << 16) + (this._g * 255 << 8) + this._b * 255;
        return this._hex;
    },
    set: function(value) {
        this.r = (value >> 16 & 0xFF) / 255;
        this.g = (value >> 8 & 0xFF) / 255;
        this.b = (value & 0xFF) / 255;
        this.a = 1;
        this._dirty = true;
    }
});

/**
 * The CSS hex representation of the color<br>
 *     Example: #AABBCC
 * @name uno.Color#cssHex
 * @type {String}
 * @default #FFFFFF
 */
Object.defineProperty(uno.Color.prototype, 'cssHex', {
    get: function() {
        if (this._dirty)
            this._cssHex = '#' + ('00000' + (this.hex | 0).toString(16)).substr(-6);
        return this._cssHex;
    },
    set: function(value) {
        this.hex = parseInt(value.substr(1), 16);
    }
});

/**
 * The CSS RGBA representation of the color<br>
 *     Example: rgba(128, 128, 128, 0.5)
 * @name uno.Color#cssRGBA
 * @type {String}
 * @default rgba(1, 1, 1, 1)
 * @readonly
 */
Object.defineProperty(uno.Color.prototype, 'cssRGBA', {
    get: function() {
        if (this._dirty) {
            this._cssRGBA = 'rgba(' + Math.floor(this._r * 255) + ',' + Math.floor(this._g * 255) +
            ',' + Math.floor(this._b * 255) + ',' + this._a + ')';
        }
        return this._cssRGBA;
    }
});

/**
 * The packed to unsigned int ABGR representation of the color
 * @name uno.Color#packedABGR
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.Color.prototype, 'packedABGR', {
    get: function() {
        if (this._dirty)
            this._packedABGR = (this._a * 255 << 24) | (this._b * 255 << 16) | (this._g * 255 << 8) | (this._r * 255);
        return this._packedABGR;
    }
});

/**
 * Transparent color
 * @const
 * @type {uno.Color}
 */
uno.Color.TRANSPARENT    = new uno.Color(0, 0, 0, 0);

/**
 * White color
 * @const
 * @type {uno.Color}
 */
uno.Color.WHITE          = new uno.Color(1, 1, 1);

/**
 * Black color
 * @const
 * @type {uno.Color}
 */
uno.Color.BLACK          = new uno.Color(0, 0, 0);

/**
 * Red color
 * @const
 * @type {uno.Color}
 */
uno.Color.RED            = new uno.Color(1, 0, 0);

/**
 * Green color
 * @const
 * @type {uno.Color}
 */
uno.Color.GREEN          = new uno.Color(0, 1, 0);

/**
 * Blue color
 * @const
 * @type {uno.Color}
 */
uno.Color.BLUE           = new uno.Color(0, 0, 1);