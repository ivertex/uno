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
    this._texture = texture;

    /**
     * Handles for each render<br>
     *     Objects with handles <code>{ texture: TEXTURE_HANDLE, buffer: FRAME_BUFFER_HANDLE }</code>,<br>
     *     buffer is null for not render textures (with texture._source not null)
     * @type {Object[]}
     * @private
     */
    this._handles = {};

    /**
     * Image data for methods getPixels/setPixels
     * @type {Uint8ClampedArray}
     * @private
     */
    this._imageData = null;
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
    this._texture = null;
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
    return buffer ? handles.buffer : handles.texture;
};

/**
 * Get or set texture pixels
 * @returns {Uint8ClampedArray}
 */
uno.WebglTexture.prototype.getPixels = function(render) {
    var tex = this._texture;
    var len = tex.width * tex.height * 4;

    if (!this._imageData || this._imageData.length !== len) {
        this._imageBuffer = new ArrayBuffer(len);
        this._imageData = new Uint8Array(this._imageBuffer);
        this._imageDataClamped = new Uint8ClampedArray(this._imageBuffer);
    }

    var ctx = render._context;
    var buffer = this.handle(render, true, true);

    ctx.bindFramebuffer(ctx.FRAMEBUFFER, buffer);
    ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, this.handle(render), 0);
    ctx.readPixels(0, 0, tex.width, tex.height, ctx.RGBA, ctx.UNSIGNED_BYTE, this._imageData);

    // TODO: rewrite after changing method 'target' to property
    var target = render._target;
    if (target === null)
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
    else
        render.target(target);

    return this._imageDataClamped;
};

/**
 * Get or set texture pixels
 * @param {Uint8ClampedArray} data - Pixels data
 * @param {uno.WebglRender} render - For what render texture created
 * @returns {CanvasTexture} - <code>this</code>
 */
uno.WebglTexture.prototype.setPixels = function(data, render) {
    if (data !== this._imageDataClamped)
        this._imageDataClamped.set(data);
    var ctx = render._context;
    ctx.bindTexture(ctx.TEXTURE_2D, this.handle(render));
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, this._texture.width, this._texture.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, this._imageData);
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
    var texture = this._texture;
    var mode = texture.scaleMode === uno.Render.SCALE_LINEAR ? ctx.LINEAR : ctx.NEAREST;
    var textureHandle = ctx.createTexture();
    var bufferHandle = null;

    ctx.bindTexture(ctx.TEXTURE_2D, textureHandle);

    // Check is texture render target or not
    if (texture.url) {

        // TODO: should we flip texture or not?
        // ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);

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

    this._handles[render.id] = { texture: textureHandle, buffer: bufferHandle };
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