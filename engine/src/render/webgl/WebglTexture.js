/**
 * WebGL texture extension
 * @param {uno.Texture} texture - Texture that holds this extension
 * @constructor
 */
uno.WebglTexture = function(texture) {
    /**
     * Parent texture for this extension
     * @type {uno.Texture}
     * @private
     */
    this.texture = texture;

    /**
     * Handles for each render<br>
     *     Objects with handles <code>{ texture: TEXTURE_HANDLE, buffer: FRAME_BUFFER_HANDLE }</code>,<br>
     *     buffer is null for not render textures (with texture._source not null)
     * @type {Object[]}
     * @private
     */
    this._handles = {};

    /**
     * Image data buffer for methods getPixels/setPixels
     * @type {ArrayBuffer}
     * @private
     */
    this._imageBuffer = null;

    /**
     * Image data view for methods getPixels/setPixels
     * @type {Uint8Array}
     * @private
     */
    this._imageData = null;

    /**
     * Image data view clamped for returning
     * @type {Uint8ClampedArray}
     * @private
     */
    this._imageDataClamped = null;

    /**
     * Image data view uint32 for Y flipping
     * @type {Uint32Array}
     * @private
     */
    this._imageData32 = null;

    /**
     * Pixel data for method getPixel
     * @type {Uint8Array}
     * @private
     */
    this._pixelData = null;
};

/**
 * Free all allocated resources and destroy texture extension
 */
uno.WebglTexture.prototype.destroy = function() {
    if (!this._handles)
        return;
    for (var id in this._handles) {
        var render = uno.Render.renders[id];
        var handle = this._handles[id];
        render._removeRestore(this);
        render._context.deleteTexture(handle.texture);
        if (handle.buffer)
            render._context.deleteFramebuffer(handle.buffer);
    }
    this._handles = null;
    this.texture = null;
};

/**
 * Get texture handle for render<br>
 *     This function called very frequently, try avoid variable creation
 * @param {uno.WebglRender} render - The render associated with handle
 * @param {Boolean} [buffer=false] - Return render buffer handle, not texture handle
 * @param {Boolean} [create=true] - Should create texture or render buffer handle if it not exist
 * @returns {WebGLTexture|WebGLFramebuffer} - Corresponding texture or render buffer handle
 */
uno.WebglTexture.prototype.handle = function(render, buffer, create) {
    var handles = this._handles[render.id];
    if (!handles || (buffer ? !handles.buffer : !handles.texture)) {
        if (create === false)
            return false;
        this._create(render);
        render._addRestore(this);
        return buffer ? this._handles[render.id].buffer : this._handles[render.id].texture;
    }
    // Scale mode changed
    if (handles.scaleMode !== this.texture.scaleMode) {
        var ctx = render._context;
        var mode = this.texture.scaleMode === uno.Render.SCALE_LINEAR ? ctx.LINEAR : ctx.NEAREST;
        ctx.bindTexture(ctx.TEXTURE_2D, handles.texture);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, mode);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, mode);
        ctx.bindTexture(ctx.TEXTURE_2D, null);
        handles.scaleMode = this.texture.scaleMode;
    }
    return buffer ? handles.buffer : handles.texture;
};

/**
 * Get texture pixels
 * @param {uno.WebglRender} render - For what render need extract pixel data
 * @param {Number} [x=0] - The x-coordinate of the extracted rect
 * @param {Number} [y=0] - The y-coordinate of the extracted rect
 * @param {Number} [width=Texture width] - The width of the extracted rect
 * @param {Number} [height=Texture height] - The height of the extracted rect
 * @returns {Uint8ClampedArray}
 */
uno.WebglTexture.prototype.getPixels = function(render, x, y, width, height) {
    var w = this.texture.width;
    var h = this.texture.height;

    x = x || 0;
    y = y || 0;
    width = width || w;
    height = height || h;

    if (x < 0 || y < 0 || x + width > w || y + height > h)
        return this;

    y = h - y - height;

    var len = width * height * 4;
    var ctx = render._context;
    var buffer = this.handle(render, true, true);

    if (!this._imageData || this._imageData.length !== len) {
        this._imageBuffer = new ArrayBuffer(len);
        this._imageData = new Uint8Array(this._imageBuffer);
        this._imageDataClamped = new Uint8ClampedArray(this._imageBuffer);
        this._imageData32 = new Uint32Array(this._imageBuffer);
    }

    ctx.bindFramebuffer(ctx.FRAMEBUFFER, buffer);
    ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, this.handle(render), 0);
    ctx.readPixels(x, y, width, height, ctx.RGBA, ctx.UNSIGNED_BYTE, this._imageData);

    var target = render._target;
    if (target === null)
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
    else
        render.target = target;

    // Flip by Y
    if (height > 1) {
        var tmp = 0;
        var data = this._imageData32;

        h = height * 0.5;
        for (y = 0; y < h; ++y) {
            for (x = 0; x < width; ++x) {
                tmp = data[y * width + x];
                data[y * width + x] = data[(height - y - 1) * width + x];
                data[(height - y - 1) * width + x] = tmp;
            }
        }
    }

    return this._imageDataClamped;
};

/**
 * Set texture pixels
 * @param {Uint8ClampedArray} data - Pixels data
 * @param {uno.WebglRender} render - For what render texture created
 * @param {Number} [x=0] - The x-coordinate of the extracted rect
 * @param {Number} [y=0] - The y-coordinate of the extracted rect
 * @param {Number} [width=Texture width] - The width of the extracted rect
 * @param {Number} [height=Texture height] - The height of the extracted rect
 * @returns {uno.WebglTexture} - <code>this</code>
 */
uno.WebglTexture.prototype.setPixels = function(data, render, x, y, width, height) {
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

    y = h - y - height;

    if (data !== this._imageDataClamped)
        this._imageDataClamped.set(data);

    var ctx = render._context;
    ctx.bindTexture(ctx.TEXTURE_2D, this.handle(render));
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
    ctx.texSubImage2D(ctx.TEXTURE_2D, 0, x, y, width, height, ctx.RGBA, ctx.UNSIGNED_BYTE, this._imageData);
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);

    return this;
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglTexture.prototype._restore = function(render) {
    if (this._handles[render.id])
        delete this._handles[render.id];
};

/**
 * Create WebGL texture helper
 * @param {uno.WebglRender} render - For what render texture created
 * @returns {Object} - Object with handles <code>{ texture: TEXTURE_HANDLE, buffer: FRAME_BUFFER_HANDLE }</code>,<br>
 *     buffer is null for not render textures (with texture._source not null)
 * @private
 */
uno.WebglTexture.prototype._create = function(render) {
    var ctx = render._context;
    var texture = this.texture;
    var mode = texture.scaleMode === uno.Render.SCALE_LINEAR ? ctx.LINEAR : ctx.NEAREST;
    var textureHandle = ctx.createTexture();
    var bufferHandle = null;

    ctx.bindTexture(ctx.TEXTURE_2D, textureHandle);

    // Check is texture render target or not
    if (texture.url) {
        ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        // Here we should get image from CanvasTexture
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, uno.CanvasTexture.get(texture).handle());
    } else {
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, texture.width, texture.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);
        bufferHandle = this._createBuffer(ctx, textureHandle, texture.width, texture.height);
    }

    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, mode);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, mode);

    if (texture.pot) {
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
    } else {
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
    }

    ctx.bindTexture(ctx.TEXTURE_2D, null);

    this._handles[render.id] = { texture: textureHandle, buffer: bufferHandle, scaleMode: texture.scaleMode };
};

/**
 * Create frame buffer
 * @param {WebGLRenderingContext} ctx - Render context
 * @param {WebGLTexture} textureHandle - Texture handle for frame buffer
 * @param {Number} width - Width of the frame buffer
 * @param {Number} height - Height of the frame buffer
 * @returns {WebGLFramebuffer}
 * @private
 */
uno.WebglTexture.prototype._createBuffer = function(ctx, textureHandle, width, height) {
    var handle = ctx.createFramebuffer();
    handle.width = width;
    handle.height = height;
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, handle);
    ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, textureHandle, 0);
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
    return handle;
};

/**
 * Get texture extension factory<br>
 *     This function called very frequently, try avoid variable creation
 * @param {uno.Texture} texture
 * @returns {uno.WebglTexture}
 */
uno.WebglTexture.get = function(texture) {
    if (!texture._extensions.webgl)
        texture._extensions.webgl = new uno.WebglTexture(texture);
    return texture._extensions.webgl;
};