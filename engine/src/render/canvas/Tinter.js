/**
 * Canvas tint helper
 * @constructor
 */
uno.CanvasTinter = function() {
};

/**
 * Do cache clearing or not
 * @type {Boolean}
 * @default true
 */
uno.CanvasTinter.CACHE_CLEAR = true;

/**
 * Quantize color to this number to caching textures for color
 * @type {Number}
 * @default 32
 */
uno.CanvasTinter.CACHE_COUNT = 32;

/**
 * If {@link uno.CanvasTinter.CACHE_CLEAR} is true, check for clearing timeout in seconds
 * @type {Number}
 * @default 5
 */
uno.CanvasTinter.CACHE_CHECK_TIMEOUT = 5;

/**
 * If {@link uno.CanvasTinter.CACHE_CLEAR} is true, life time for tinted texture in seconds
 * @type {Number}
 * @default 30
 */
uno.CanvasTinter.CACHE_TTL = 30;

/**
 * Timer for cache cleaning
 * @type {Number}
 * @private
 */
uno.CanvasTinter._cacheTimer = 0;

/**
 * Cached textures
 * @type {Array}
 * @private
 */
uno.CanvasTinter._cacheTextures = [];

/**
 * Tint texture in canvas mode that not supported it native
 * @param {uno.CanvasTexture} texture - Source texture
 * @param {uno.Color} color - Tint color
 * @returns {HTMLCanvasElement} - Result tinted texture
 */
uno.CanvasTinter.tint = function(texture, color) {
    if (color.equal(uno.Color.WHITE))
        return texture.texture._source;

    if (uno.CanvasTinter._multiplyMode === undefined)
        uno.CanvasTinter._multiplyMode = uno.CanvasState.BLEND_EXTENDED;

    if (!uno.CanvasTinter._color)
        uno.CanvasTinter._color = color.clone();
    else
        uno.CanvasTinter._color.set(color);

    var tint = uno.CanvasTinter._color;
    tint.quantize(uno.CanvasTinter.CACHE_COUNT);

    var cache = texture._tintCache[tint.hex];
    if (cache)
        return cache.canvas;

    var image = texture._source;
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    if (uno.CanvasTinter._multiplyMode)
        uno.CanvasTinter._tintMultiply(canvas.getContext('2d'), image, tint);
    else
        uno.CanvasTinter._tintPixel(canvas.getContext('2d'), image, tint);

    texture._tintCache[tint.hex] = { canvas: canvas, stamp: uno.time() };

    if (uno.CanvasTinter.CACHE_CLEAR) {
        if (uno.CanvasTinter._cacheTextures.indexOf(texture) === -1)
            uno.CanvasTinter._cacheTextures.push(texture);

        if (!uno.CanvasTinter._cacheTimer)
            uno.CanvasTinter._cacheTimer = setInterval(uno.CanvasTinter._checkCache, uno.CanvasTinter.CACHE_CHECK_TIMEOUT * 1000);
    }

    return canvas;
};

/**
 * Clear cache for texture
 * @param {canvas|Image} canvasTexture - Clear cache for this texture
 */
uno.CanvasTinter.removeCache = function(canvasTexture) {
    for (var i in canvasTexture._tintCache)
        canvasTexture._tintCache[i].canvas = null;
    canvasTexture._tintCache = {};

    var index = uno.CanvasTinter._cacheTextures.indexOf(canvasTexture);
    if (index === -1)
        uno.CanvasTinter._cacheTextures.splice(index, 1);
};

/**
 * Check cache for deleting
 * @private
 */
uno.CanvasTinter._checkCache = function() {
    var stamp = uno.time();
    var ttl = uno.CanvasTinter.CACHE_TTL * 1000;
    var cache, i, j, l, count;

    for (i = 0, l = uno.CanvasTinter._cacheTextures.length; i < l; ++i) {
        cache = uno.CanvasTinter._cacheTextures[i]._tintCache;
        count = 0;

        for (j in cache) {
            if (stamp - cache[j].stamp >= ttl)
                delete cache[j];
            else
                ++count;
        }

        if (!count) {
            uno.CanvasTinter._cacheTextures.splice(i, 1);
            --i;
            --l;
        }
    }
};

/**
 * Tint texture using multiply blend mode
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} image - Source image
 * @param {uno.Color} color - Tint color
 * @private
 */
uno.CanvasTinter._tintMultiply = function(ctx, image, color) {
    ctx.fillStyle = color.cssHex;
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    ctx.globalCompositeOperation = 'destination-atop';
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
};

/**
 * Tint texture using per pixel method (slow)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} image - Source image
 * @param {uno.Color} color - Tint color
 * @private
 */
uno.CanvasTinter._tintPixel = function(ctx, image, color) {
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

    var r = color.r;
    var g = color.g;
    var b = color.b;
    var data = ctx.getImageData(0, 0, image.width, image.height);
    var pixels = data.data;

    for (var i = 0, l = pixels.length; i < l; i += 4) {
        pixels[i] *= r;
        pixels[i + 1] *= g;
        pixels[i + 2] *= b;
    }

    ctx.putImageData(data, 0, 0);
};