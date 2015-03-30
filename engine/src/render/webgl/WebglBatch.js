/**
 * Sprite batcher for WebGL render. Used for rendering sprites with minimum draw calls
 * @param {uno.WebglRender} render - WebGL render instance
 * @constructor
 */
uno.WebglBatch = function(render) {
    /**
     * Host render
     * @type {uno.WebglRender}
     * @private
     */
    this._render = render;

    /**
     * Current used shader
     * @type {uno.WebglShader}
     * @private
     */
    this._currentShader = null;

    /**
     * Size of vertex in buffer (x, y, u, v, abgr pack - alpha and tint color, 4 byte each)
     * @type {Number}
     * @private
     */
    this._vertexSize = 5;

    /**
     * Size of sprite in buffer (4 vertices 5 values, 4 bytes each)
     * @type {Number}
     * @private
     */
    this._spriteSize = this._vertexSize * 4;

    /**
     * Maximum sprites in one batch
     * @type {Number}
     * @private
     */
    this._maxSpriteCount = 2000;

    /**
     * Indeces array (for each sprite 6 indices)
     * @type {UInt16Array}
     * @private
     */
    this._indices = new Uint16Array(this._maxSpriteCount * 6);

    /**
     * Array with all vertices data
     * @type {ArrayBuffer}
     * @private
     */
    this._vertices = new ArrayBuffer(this._maxSpriteCount * this._spriteSize * 4);

    /**
     * View for vertices array with float32 type (for x, y, u, v values fill)
     * @type {Float32Array}
     * @private
     */
    this._positions = new Float32Array(this._vertices);

    /**
     * View for tint colors array with uint32 type (for abgr pack - alpha and tint color)
     * @type {Uint32Array}
     * @private
     */
    this._colors = new Uint32Array(this._vertices);

    /**
     * Array states of the batch (each item is number of sprites with equal texture and blend mode together)
     * @type {Uint16Array}
     * @private
     */
    this._states = new Uint16Array(this._maxSpriteCount);

    /**
     * Count of states in current batch
     * @type {Number}
     * @private
     */
    this._stateCount = 0;

    /**
     * Blend modes for each state of batch
     * @type {Uint8Array}
     * @private
     */
    this._stateBlendModes = new Uint8Array(this._maxSpriteCount);

    /**
     * Last blend mode added to states
     * @type {Number}
     * @private
     */
    this._stateBlendModeLast = -1;

    /**
     * Textures for each state of the batch
     * @type {Array}
     * @private
     */
    this._stateTextures = [];

    /**
     * Last texture added to states
     * @type {uno.Texture}
     * @private
     */
    this._stateTextureLast = null;

    /**
     * Count of sprites in batch
     * @type {Number}
     * @private
     */
    this._spriteCount = 0;

    this._prepare();
    this._restore();

    render._addRestore(this);
};

/**
 * Free all allocated resources and destroy sprite batch
 */
uno.WebglBatch.prototype.destroy = function() {
    this._render._removeRestore(this);
    var ctx = this._render._context;
    ctx.destroyBuffer(this._vertexBuffer);
    ctx.destroyBuffer(this._indexBuffer);
    this.texture = null;
    this._indices = null;
    this._vertices = null;
    this._positions = null;
    this._colors = null;
    this._currentShader = null;
    this._render = null;
    this._states = null;
    this._stateBlendModes = null;
    this._stateTextures = null;
};

/**
 * Prepare batch data
 * @private
 */
uno.WebglBatch.prototype._prepare = function() {
    this._stateTextures.length = this._maxSpriteCount;
    var indices = this._indices;
    for (var i = 0, j = 0, l = indices.length; i < l; i += 6, j += 4) {
        indices[i + 0] = j + 0;
        indices[i + 1] = j + 1;
        indices[i + 2] = j + 2;
        indices[i + 3] = j + 0;
        indices[i + 4] = j + 2;
        indices[i + 5] = j + 3;
    }
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglBatch.prototype._restore = function() {
    var ctx = this._render._context;
    this._vertexBuffer = ctx.createBuffer();
    this._indexBuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this._vertexBuffer);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, this._indices, ctx.STATIC_DRAW);
    ctx.bufferData(ctx.ARRAY_BUFFER, this._vertices, ctx.DYNAMIC_DRAW);
};

/**
 * Add sprite to batch queue
 * @param {uno.WebglTexture} texture - WebGL texture instance
 * @param {Number} x - The x-coordinate of the texture frame
 * @param {Number} y - The x-coordinate of the texture frame
 * @param {Number} width - The width of the texture frame
 * @param {Number} height - The height of the texture frame
 * @param {Number} alpha - Texture opacity
 * @param {uno.Color} tint - The texture tint color
 */
uno.WebglBatch.prototype.render = function(texture, x, y, width, height, alpha, tint) {
    var tw = texture.texture.width;
    var th = texture.texture.height;
    var render = this._render;
    var matrix = render._currentMatrix;
    var blendMode = render._currentBlendMode;
    var a = matrix.a;
    var b = matrix.c;   // TODO: why we flip values?
    var c = matrix.b;
    var d = matrix.d;
    var tx = matrix.tx;
    var ty = matrix.ty;

    // Using packing ABGR (alpha and tint color)
    var color = tint.packedABGR & 0x00ffffff | (alpha * 255 << 24);
    var i = this._spriteCount * this._spriteSize;
    var vp = this._positions;
    var vc = this._colors;

    var uvx0;
    var uvy0;
    var uvx1;
    var uvy1;

    // Check for render target and flip if it is
    if (texture.handle(render, true, false)) {
        uvx0 = x / tw;
        uvy0 = (y + height) / th;
        uvx1 = (x + width) / tw;
        uvy1 = y / th;
    } else {
        uvx0 = x / tw;
        uvy0 = y / th;
        uvx1 = (x + width) / tw;
        uvy1 = (y + height) / th;
    }

    vp[i++] = tx;
    vp[i++] = ty;
    vp[i++] = uvx0;
    vp[i++] = uvy0;
    vc[i++] = color;

    vp[i++] = a * width + tx;
    vp[i++] = b * width + ty;
    vp[i++] = uvx1;
    vp[i++] = uvy0;
    vc[i++] = color;

    vp[i++] = a * width + c * height + tx;
    vp[i++] = d * height + b * width + ty;
    vp[i++] = uvx1;
    vp[i++] = uvy1;
    vc[i++] = color;

    vp[i++] = c * height + tx;
    vp[i++] = d * height + ty;
    vp[i++] = uvx0;
    vp[i++] = uvy1;
    vc[i++] = color;

    ++this._spriteCount;
    this._saveState(texture.handle(render), blendMode);
    if (this._spriteCount >= this._maxSpriteCount)
        this.flush();
};

/**
 * Render all current batched textures and free batch buffers
 * @returns {Boolean} - Is rendered anything
 */
uno.WebglBatch.prototype.flush = function() {
    if (!this._spriteCount)
        return false;

    var render = this._render;
    var ctx = render._context;

    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this._vertexBuffer);

    var shader = this._currentShader;
    if (!shader)
        shader = this._currentShader = render._getShader(uno.WebglShader.SPRITE);
    if (shader !== render._getShader())
        render._setShader(shader);

    // If batch have size more than max half send it all to GPU, otherwise send subarray (minimize send size)
    if (this._spriteCount > this._maxSpriteCount * 0.5)
        ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this._vertices);
    else
        ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this._positions.subarray(0, this._spriteCount * this._spriteSize));

    var states = this._states;
    var modes = this._stateBlendModes;
    var textures = this._stateTextures;
    var sampler = shader.uSampler;
    var index = 0;
    var count = 0;
    var texture, current = null;

    for (var i = 0, l = this._stateCount; i < l; ++i) {
        render._applyBlendMode(modes[i]);
        texture = textures[i];
        if (texture !== current) {
            sampler.texture(0, texture);
            current = texture;
        }
        count = states[i];
        ctx.drawElements(ctx.TRIANGLES, count - index, ctx.UNSIGNED_SHORT, index * 2);
        index = count;
    }

    // Clear all links to textures
    for (i = 0, l = this._stateCount; i < l; ++i)
        states[i] = null;
    this._stateTextureLast = null;

    this._stateBlendModeLast = uno.Render.BLEND_NORMAL;
    this._stateCount = 0;
    this._spriteCount = 0;
};

/**
 * Save texture and blend mode state for batching
 * @param {WebGLTexture} texture - Changed texture
 * @param {Number} blendMode - Changed blend mode. See {@link uno.Render} constants
 * @private
 */
uno.WebglBatch.prototype._saveState = function(texture, blendMode) {
    if (texture === this._stateTextureLast &&
        blendMode === this._stateBlendModeLast && this._stateCount) {
        this._states[this._stateCount - 1] = this._spriteCount * 6;
        return;
    }
    this._states[this._stateCount] = this._spriteCount * 6;
    this._stateTextures[this._stateCount] = texture;
    this._stateTextureLast = texture;
    this._stateBlendModes[this._stateCount] = blendMode;
    this._stateBlendModeLast = blendMode;
    ++this._stateCount;
};