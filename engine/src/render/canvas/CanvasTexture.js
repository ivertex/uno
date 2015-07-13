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
     * Texture pattern if texture used in tiling draw
     * @type {Object}
     * @private
     */
    this._patternCache = {};

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
    this._patternCache = {};
    this._imageData = null;
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
 * @param {uno.Color} [tint] - Tint color
 * @returns {Image|canvas} - Texture canvas
 */
uno.CanvasTexture.prototype.handle = function(tint) {
    if (this._source === null && this.texture.width && this.texture.height) {
        var source = document.createElement('canvas');
        source.width = this.texture.width;
        source.height = this.texture.height;
        this._source = source;

        if (uno.WebglTexture.has(this.texture)) {
            var tex = uno.WebglTexture.get(this.texture);
            // TODO: Here we hope that we have only one webgl texture handle
            this.setPixels(tex.getPixels(tex._renders[0]));
        }
    }

    if (!tint || tint.equal(uno.Color.WHITE))
        return this._source;

    return uno.CanvasTinter.tint(this, tint);
};

/**
 * Get texture pattern for render
 * @param {uno.CanvasRender} render - Render that used texture pattern
 * @param {uno.Color} tint - Tint color
 * @returns {CanvasPattern} - Texture pattern
 */
uno.CanvasTexture.prototype.pattern = function(render, tint) {
    var handle = this.handle(tint);
    if (!this._patternCache[handle])
        this._patternCache[handle] = render._context.createPattern(handle, 'repeat');
    return this._patternCache[handle];
};

/**
 * Get or set texture pixels
 * @param {Number} [x=0] - The x-coordinate of the extracted rect
 * @param {Number} [y=0] - The y-coordinate of the extracted rect
 * @param {Number} [width=Texture width] - The width of the extracted rect
 * @param {Number} [height=Texture height] - The height of the extracted rect
 * @returns {Uint8ClampedArray}
 */
uno.CanvasTexture.prototype.getPixels = function(x, y, width, height) {
    var w = this.texture.width;
    var h = this.texture.height;

    x = x || 0;
    y = y || 0;
    width = width || w;
    height = height || h;

    if (x < 0 || y < 0 || x + width > w || y + height > h)
        return null;

    this._imageData = this.context().getImageData(x, y, width, height);

    return this._imageData.data;
};

/**
 * Get or set texture pixels
 * @param {Uint8ClampedArray} data - Pixels data
 * @param {Number} [x=0] - The x-coordinate of the extracted rect
 * @param {Number} [y=0] - The y-coordinate of the extracted rect
 * @param {Number} [width=Texture width] - The width of the extracted rect
 * @param {Number} [height=Texture height] - The height of the extracted rect
 * @returns {uno.CanvasTexture} - <code>this</code>
 */
uno.CanvasTexture.prototype.setPixels = function(data, x, y, width, height) {
    var w = this.texture.width;
    var h = this.texture.height;

    x = x || 0;
    y = y || 0;
    width = width || w;
    height = height || h;

    if (!data || width * height * 4 !== data.length)
        return this;

    if (x < 0 || y < 0 || x + width > w || y + height > h)
        return this;

    var idata = this._imageData;

    if (!idata)
        idata = this._imageData = this.context().getImageData(x, y, width, height);

    if (idata.data !== data)
        idata.data.set(data);

    this.context().putImageData(idata, x, y);

    return this;
};

/**
 * Load texture
 * @param {String} url - URL of the image
 * @param {Function} complete - Call function after load
 * @param {Boolean} [cache=true] - Should the texture cached
 */
uno.CanvasTexture.prototype.load = function(url, complete, cache) {
    if (url === this._url)
        return this._source;
    if (uno.CanvasTexture._cache[url]) {
        this._source = uno.CanvasTexture._cache[url];
        uno.CanvasTinter.removeCache(this);
        this._patternCache = {};
        complete(url, true, this._source.width, this._source.height);
        return;
    }
    var source = new Image();
    var self = this;
    source.addEventListener('load', function() {
        if (cache !== false)
            uno.CanvasTexture._cache[url] = cache;
        self._source = source;
        uno.CanvasTinter.removeCache(self);
        self._patternCache = {};
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
 * Texture extension check
 * @param {uno.Texture} texture
 * @returns {Boolean}
 */
uno.CanvasTexture.has = function(texture) {
    return !!texture._extensions.canvas;
};

/**
 * Texture data global cache by URL
 * @type {Object}
 * @private
 */
uno.CanvasTexture._cache = {};