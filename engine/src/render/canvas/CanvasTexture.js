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
    this._texture = texture;

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
};

/**
 * Free all allocated resources and destroy texture extension
 */
uno.CanvasTexture.prototype.destroy = function() {
    uno.CanvasTinter.removeCache(this);
    this._texture = null;
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
    if (this._source === null && this._texture.width && this._texture.height) {
        var source = document.createElement('canvas');
        source.width = this._texture.width;
        source.height = this._texture.height;
        this._source = source;
    }
    return this._source;
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