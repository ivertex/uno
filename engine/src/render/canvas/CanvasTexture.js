/**
 * Canvas texture extension
 * @param {uno.Texture} texture - Texture that holds this extension
 * @constructor
 */
uno.CanvasTexture = function(texture) {
    /**
     * Parent texture for this extension
     * @type {uno.Texture}
     * @private
     */
    this.texture = texture;

    /**
     * Image or canvas with texture data
     * @type {Image|canvas}
     * @private
     */
    this._source = null;

    /**
     * Texture context for manipulation
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._context = null;

    /**
     * Cache for texture tinting
     * @type {Object}
     * @private
     */
    this._tintCache = {};

    /**
     * Image data for methods getPixels/setPixels
     * @type {ImageData}
     * @private
     */
    this._imageData = null;
};

/**
 * Free all allocated resources and destroy texture extension
 */
uno.CanvasTexture.prototype.destroy = function() {
    uno.CanvasTinter.removeCache(this);
    this.texture = null;
    this._source = null;
    this._context = null;
    this._tintCache = null;
};

/**
 * Tint texture using {@link uno.CanvasTinter}
 * @param {uno.Color} tint - Tint color
 * @returns {canvas}
 */
uno.CanvasTexture.prototype.tint = function(tint) {
    return uno.CanvasTinter.tint(this, tint);
};

/**
 * Return 2d context of the texture for render target<br>
 *     This function called very frequently, try avoid variable creation
 * @returns {CanvasRenderingContext2D}
 */
uno.CanvasTexture.prototype.context = function() {
    if (!this._context)
        this._context = this._source.getContext('2d');
    return this._context;
};

/**
 * Get texture handle for render<br>
 *     This function called very frequently, try avoid variable creation
 * @returns {Image|canvas} - Texture canvas
 */
uno.CanvasTexture.prototype.handle = function() {
    if (this._source === null && this.texture.width && this.texture.height) {
        var source = document.createElement('canvas');
        source.width = this.texture.width;
        source.height = this.texture.height;
        this._source = source;
    }
    return this._source;
};

/**
 * Get or set texture pixels
 * @returns {Uint8ClampedArray}
 */
uno.CanvasTexture.prototype.getPixel = function(x, y) {
    return this.context().getImageData(x, y, 1, 1).data;
};

/**
 * Get or set texture pixels
 * @returns {Uint8ClampedArray}
 */
uno.CanvasTexture.prototype.getPixels = function() {
    this._imageData = this.context().getImageData(0, 0, this.texture.width, this.texture.height);
    return this._imageData.data;
};

/**
 * Get or set texture pixels
 * @param {Uint8ClampedArray} data - Pixels data
 * @returns {CanvasTexture} - <code>this</code>
 */
uno.CanvasTexture.prototype.setPixels = function(data) {
    if (this._imageData.data !== data)
        this._imageData.set(data);
    this.context().putImageData(this._imageData, 0, 0);
    return this;
};

/**
 * Load texture
 * @param {String} url - URL of the image
 * @param {Function} complete - Call function after load
 * @param {Boolean} [cache=true] - Should the texture cached
 */
uno.CanvasTexture.prototype.load = function(url, complete, cache) {
    if (uno.CanvasTexture._cache[url]) {
        this._source = uno.CanvasTexture._cache[url];
        complete(url, true, this._source.width, this._source.height);
        return;
    }
    var source = new Image();
    var self = this;
    source.addEventListener('load', function() {
        if (cache !== false)
            uno.CanvasTexture._cache[url] = cache;
        self._source = source;
        complete(url, true, source.width, source.height);
    });
    source.addEventListener('error', function() {
        complete(url, false);
    });
    source.src = url;
    return source;
};

/**
 * Get texture extension factory<br>
 *     This function called very frequently, try avoid variable creation
 * @param {uno.Texture} texture
 * @returns {uno.CanvasTexture}
 */
uno.CanvasTexture.get = function(texture) {
    if (!texture._extensions.canvas)
        texture._extensions.canvas = new uno.CanvasTexture(texture);
    return texture._extensions.canvas;
};

/**
 * Texture data global cache by URL
 * @type {Object}
 * @private
 */
uno.CanvasTexture._cache = {};