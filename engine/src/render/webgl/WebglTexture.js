/**
 * WebGL texture extension
 * @param {uno.Texture} texture - Texture that holds this extension
 * @constructor
 */
uno.WebglTexture = function(texture) {
    /**
     * Host texture
     * @type {uno.Texture}
     * @private
     */
    this._texture = texture;

    /**
     * Handles for each render
     * @type {WebGLTexture[]}
     * @private
     */
    this._handles = {};
};

/**
 * Free all allocated resources and destroy texture extension
 */
uno.WebglTexture.prototype.destroy = function() {
    if (!this._handles)
        return;
    for (var id in this._handles) {
        var render = uno.Render.renders[id];
        render._removeRestore(this);
        render._context.deleteTexture(this._handles[id]);
    }
    this._handles = null;
    this._texture = null;
};

/**
 * Get texture handle for render
 * @param {uno.WebglRender} render - The render needed handle
 * @returns {WebGLTexture} - Corresponding texture
 */
uno.WebglTexture.prototype.handle = function(render) {
    if (!this._handles[render.id]) {
        this._handles[render.id] = uno.WebglTexture._create(render, this._texture);
        render._addRestore(this);
    }
    return this._handles[render.id];
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
 * Get texture extension factory
 * @param {uno.Texture} texture
 * @returns {uno.WebglTexture}
 */
uno.WebglTexture.get = function(texture) {
    if (!texture._extensions.webgl)
        texture._extensions.webgl = new uno.WebglTexture(texture);
    return texture._extensions.webgl;
};

/**
 * Create WebGL texture helper
 * @param {uno.WebglRender} render - For what render texture created
 * @param {uno.Texture} texture - Texture from which create
 * @returns {WebGLTexture} - Created texture
 * @private
 */
uno.WebglTexture._create = function(render, texture) {
    var ctx = render._context;
    var tex = ctx.createTexture();
    var mode = texture.scaleMode === uno.Render.SCALE_LINEAR ? ctx.LINEAR : ctx.NEAREST;

    ctx.bindTexture(ctx.TEXTURE_2D, tex);
    ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture._source);
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
    return tex;
};