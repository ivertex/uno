/**
 * Texture stores the information that represents an image
 * @constructor
 */
uno.Texture = function(width, height) {
    /**
     * The texture unique id
     * @type {Number}
     * @readonly
     */
    this.id = uno.Texture._uid++;

    /**
     * The texture scale mode<br>
     *     See {@link uno.Render} constants
     * @type {Number}
     * @default uno.Render.SCALE_DEFAULT
     */
    this.scaleMode = uno.Render.SCALE_DEFAULT;

    /**
     * The texture image data
     * @type {Number}
     * @private
     */
    this._source = null;

    /**
     * Is texture loaded
     * @type {Boolean}
     * @private
     */
    this._ready = false;

    /**
     * The texture extensions for renders
     * @type {Number}
     * @private
     */
    this._extensions = {};

    if (!width || !height)
        return;

    if (uno.Browser.any) {
        this._source = uno.CanvasTexture.create(width, height);
        this._pot = uno.Math.isPOT(this._source.width) && uno.Math.isPOT(this._source.height);
        this._ready = true;
        return;
    }
    uno.error('Only browsers currently supported');
};

/**
 * Texture global counter
 * @type {Number}
 * @private
 */
uno.Texture._uid = 0;

/**
 * Load texture from URL
 * @param {String} url - The image URL
 * @param {Function} complete - Function to call after loading
 * @param {Boolean} [cache=true] - Should the texture cached
 * @returns {uno.Texture} - <code>this</code>
 */
uno.Texture.prototype.load = function(url, complete, cache) {
    if (this._source)
        this.destroy();
    if (uno.Browser.any) {
        this._source = uno.CanvasTexture.load(url, this._onLoad.bind(this, complete), cache);
        return this;
    }
    uno.error('Only browsers currently supported');
};

/**
 * Destroy texture data
 */
uno.Texture.prototype.destroy = function() {
    for (var i in this._extensions)
        this._extensions[i].destroy();
    this.scaleMode = uno.Render.SCALE_DEFAULT;
    this._pot = false;
    this._ready = false;
    this._source = null;
    this._extensions = null;
};

/**
 * The width of the texture
 * @name uno.Texture#width
 * @type {Number}
 * @default 0
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'width', {
    get: function() {
        if (!this._source || !this._ready)
            return 0;
        return this._source.width;
    }
});

/**
 * The height of the texture
 * @name uno.Texture#height
 * @type {Number}
 * @default 0
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'height', {
    get: function() {
        if (!this._source || !this._ready)
            return 0;
        return this._source.height;
    }
});

/**
 * Is the texture ready for use (loaded or created)
 * @name uno.Texture#ready
 * @type {Boolean}
 * @default false
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'ready', {
    get: function() {
        return this._source && this._ready;
    }
});

/**
 * Is the texture width and height power of two
 * @name uno.Texture#pot
 * @type {Boolean}
 * @default false
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'pot', {
    get: function() {
        return this._pot;
    }
});

/**
 * Process loaded texture
 * @param {Function} complete - Function to call after loading
 * @param {Object} result - The loaded texture or null if load error occured
 * @param {String} url - URL of the texture
 * @private
 */
uno.Texture.prototype._onLoad = function(complete, result, url) {
    if (!result)
        return uno.error('Can\'t load image', '[', url, ']');
    this._pot = uno.Math.isPOT(this._source.width) && uno.Math.isPOT(this._source.height);
    this._ready = true;
    if (complete)
        complete(this);
};