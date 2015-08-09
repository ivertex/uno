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
     * List of linked renders
     * @type {Array}
     * @private
     */
    this._renders = [];

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
};

/**
 * Free all allocated resources and destroy texture extension
 */
uno.WebglTexture.prototype.destroy = function() {
    var count = this._renders.length;
    if (!count)
        return;

    for (var i = 0; i < count; ++i) {
        var render = this._renders[i];
        var handle = this._handles[render.id];
        render._removeRestore(this);
        render._context.deleteTexture(handle.texture);
        if (handle.buffer)
            render._context.deleteFramebuffer(handle.buffer);
    }

    this._handles = null;
    this._renders = null;
    this._imageBuffer = null;
    this._imageData = null;
    this._imageDataClamped = null;
    this._imageData32 = null;
    this.texture = null;
};

/**
 * Free only render allocated resources (used when render destroyed)
 */
uno.WebglTexture.prototype.destroyHandle = function(render) {
    var handle = this._handles[render.id];
    if (!handle)
        return;

    render._context.deleteTexture(handle.texture);
    if (handle.buffer)
        render._context.deleteFramebuffer(handle.buffer);

    delete this._handles[render.id];
    this._renders.splice(this._renders.indexOf(render), 1);
};

/**
 * Get texture handle for render<br>
 *     This function called very frequently, try avoid variable creation
 * @param {uno.WebglRender} render - The render associated with handle
 * @param {Boolean} [buffer=false] - Return render buffer handle, not texture handle
 * @returns {WebGLTexture|WebGLFramebuffer} - Corresponding texture or render buffer handle
 */
uno.WebglTexture.prototype.handle = function(render, buffer) {
    var handles = this._handles[render.id];

    if (!handles || (buffer ? !handles.buffer : !handles.texture)) {
        this._create(render);
        render._addRestore(this);
        return buffer ? this._handles[render.id].buffer : this._handles[render.id].texture;
    }

    // Scale mode changed
    if (handles.scale !== this.texture.scale) {
        var ctx = render._context;
        var consts = uno.WebglConsts;
        var mode = this.texture.scale === uno.Render.SCALE_LINEAR ? consts.LINEAR : consts.NEAREST;

        ctx.bindTexture(consts.TEXTURE_2D, handles.texture);
        ctx.texParameteri(consts.TEXTURE_2D, consts.TEXTURE_MAG_FILTER, mode);
        ctx.texParameteri(consts.TEXTURE_2D, consts.TEXTURE_MIN_FILTER, mode);
        ctx.bindTexture(consts.TEXTURE_2D, null);
        handles.scale = this.texture.scale;
    }

    return buffer ? handles.buffer : handles.texture;
};

/**
 * Check texture handle for render for exists<br>
 *     This function called very frequently, try avoid variable creation
 * @param {uno.WebglRender} render - The render associated with handle
 * @param {Boolean} [buffer=false] - Check for render buffer or texture handle
 * @returns {Boolean} - Handle existing
 */
uno.WebglTexture.prototype.hasHandle = function(render, buffer) {
    var handles = this._handles[render.id];
    return handles && (buffer ? handles.buffer : handles.texture);
};

/**
 * Lose method for handling context loosing
 * @private
 */
uno.WebglTexture.prototype._lose = function(render) {
    this.destroyHandle(render);
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
    var consts = uno.WebglConsts;
    var mode = texture.scale === uno.Render.SCALE_LINEAR ? consts.LINEAR : consts.NEAREST;
    var textureHandle = ctx.createTexture();
    var bufferHandle = null;

    ctx.bindTexture(consts.TEXTURE_2D, textureHandle);

    // Has texture canvas data?
    if (uno.CanvasTexture.has(texture)) {
        ctx.pixelStorei(consts.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        ctx.texImage2D(consts.TEXTURE_2D, 0, consts.RGBA, consts.RGBA, consts.UNSIGNED_BYTE, uno.CanvasTexture.get(texture).handle());

        // Canvas data is render buffer
        if (!texture.url)
            bufferHandle = this._createBuffer(ctx, textureHandle, texture.width, texture.height);
    } else {
        // Only webgl buffer
        ctx.texImage2D(consts.TEXTURE_2D, 0, consts.RGBA, texture.width, texture.height, 0, consts.RGBA, consts.UNSIGNED_BYTE, null);
        bufferHandle = this._createBuffer(ctx, textureHandle, texture.width, texture.height);
    }

    ctx.texParameteri(consts.TEXTURE_2D, consts.TEXTURE_MAG_FILTER, mode);
    ctx.texParameteri(consts.TEXTURE_2D, consts.TEXTURE_MIN_FILTER, mode);

    if (texture.pot) {
        ctx.texParameteri(consts.TEXTURE_2D, consts.TEXTURE_WRAP_S, consts.REPEAT);
        ctx.texParameteri(consts.TEXTURE_2D, consts.TEXTURE_WRAP_T, consts.REPEAT);
    } else {
        ctx.texParameteri(consts.TEXTURE_2D, consts.TEXTURE_WRAP_S, consts.CLAMP_TO_EDGE);
        ctx.texParameteri(consts.TEXTURE_2D, consts.TEXTURE_WRAP_T, consts.CLAMP_TO_EDGE);
    }

    ctx.bindTexture(consts.TEXTURE_2D, null);

    this._handles[render.id] = { texture: textureHandle, buffer: bufferHandle, scale: texture.scale };
    this._renders.push(render);
};

/**
 * Create frame buffer
 * @param {WebGLRenderingContext} ctx - Render context
 * @param {WebGLTexture} texture - Texture handle for frame buffer
 * @param {Number} width - Width of the frame buffer
 * @param {Number} height - Height of the frame buffer
 * @returns {WebGLFramebuffer}
 * @private
 */
uno.WebglTexture.prototype._createBuffer = function(ctx, texture, width, height) {
    var handle = ctx.createFramebuffer();
    var consts = uno.WebglConsts;

    handle.width = width;
    handle.height = height;

    ctx.bindFramebuffer(consts.FRAMEBUFFER, handle);
    ctx.framebufferTexture2D(consts.FRAMEBUFFER, consts.COLOR_ATTACHMENT0, consts.TEXTURE_2D, texture, 0);
    ctx.bindFramebuffer(consts.FRAMEBUFFER, null);

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

/**
 * Texture extension check
 * @param {uno.Texture} texture
 * @returns {Boolean}
 */
uno.WebglTexture.has = function(texture) {
    return !!texture._extensions.webgl;
};