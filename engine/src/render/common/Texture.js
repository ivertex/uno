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
     * Width of the texture
     * @type {Number}
     * @private
     */
    this._width = 0;

    /**
     * Height of the texture
     * @type {Number}
     * @private
     */
    this._height = 0;

    /**
     * Is texture loaded
     * @type {Boolean}
     * @private
     */
    this._ready = false;

    /**
     * URL if texture is loaded
     * @type {Boolean}
     * @private
     */
    this._url = null;

    /**
     * The texture extensions for renders
     * @type {Number}
     * @private
     */
    this._extensions = {};

    if (!width || !height)
        return;

    if (uno.Browser.any) {
        this._width = width;
        this._height = height;
        this._pot = uno.Math.isPOT(width) && uno.Math.isPOT(height);
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

    // TODO: This block is platform specific. Should we do anything with it?
    if (uno.Browser.any) {
        uno.CanvasTexture.get(this).load(url, this._onLoad.bind(this, complete), cache);
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
        return this._width;
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
        return this._height;
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
        return this._ready;
    }
});

/**
 * If texture loaded URL returned else null
 * @name uno.Texture#url
 * @type {String}
 * @default false
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'url', {
    get: function() {
        return this._url;
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
 * @param {Object} success - True if loading success
 * @param {String} url - URL of the texture
 * @param {Number} width - Width of the loaded texture
 * @param {Number} height - Height of the loaded texture
 * @private
 */
uno.Texture.prototype._onLoad = function(complete, url, success, width, height) {
    if (!success)
        return uno.error('Can\'t load image', '[', url, ']');
    this._width = width;
    this._height = height;
    this._pot = uno.Math.isPOT(width) && uno.Math.isPOT(height);
    this._url = url;
    this._ready = true;
    if (complete)
        complete(this);
};