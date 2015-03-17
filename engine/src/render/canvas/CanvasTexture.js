/**
 * Canvas texture extension
 * @param {uno.Texture} texture - Texture that holds this extension
 * @constructor
 */
uno.CanvasTexture = function(texture) {
    this._texture = texture;
    this._context = null;
    this._tintCache = {};
};

/**
 * Free all allocated resources and destroy texture extension
 */
uno.CanvasTexture.prototype.destroy = function() {
    uno.CanvasTinter.removeCache(this);
    this._texture = null;
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
 * Return 2d context of the texture for render target
 * @returns {CanvasRenderingContext2D}
 */
uno.CanvasTexture.prototype.context = function() {
    if (!this._context)
        this._context = this._texture._source.getContext('2d');
    return this._context;
};

/**
 * Get texture handle for render
 * @returns {canvas} - Texture canvas
 */
uno.CanvasTexture.prototype.handle = function() {
    return this._texture._source;
};

/**
 * Get texture extension factory
 * @param {uno.Texture} texture
 * @returns {uno.CanvasTexture}
 */
uno.CanvasTexture.get = function(texture) {
    if (!texture._extensions.canvas)
        texture._extensions.canvas = new uno.CanvasTexture(texture);
    return texture._extensions.canvas;
};

/**
 * Create texture
 * @param {Number} width - With of the texture
 * @param {Number} height - Height of the texture
 * @returns {canvas}
 */
uno.CanvasTexture.create = function(width, height) {
    var texture = document.createElement('canvas');
    texture.width = width;
    texture.height = height;
    return texture;
};

/**
 * Load texture
 * @param {String} url - URL of the image
 * @param {Function} complete - Call function after load
 * @param {Boolean} [cache=true] - Should the texture cached
 * @returns {canvas}
 */
uno.CanvasTexture.load = function(url, complete, cache) {
    if (uno.CanvasTexture._cache[url])
        return uno.CanvasTexture._cache[url];
    var texture = new Image();
    texture.addEventListener('load', function() {
        if (cache !== false)
            uno.CanvasTexture._cache[url] = cache;
        complete(texture, url);
    });
    texture.addEventListener('error', function() {
        complete(null, url);
    });
    texture.src = url;
    return texture;
};

/**
 * Texture data global cache by URL
 * @type {Object}
 * @private
 */
uno.CanvasTexture._cache = {};