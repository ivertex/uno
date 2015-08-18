/**
 * Sprite batcher for WebGL render. Used for rendering sprites with minimum draw calls
 * @param {uno.WebglRender} render - WebGL render instance
 * @constructor
 * @ignore
 */
uno.WebglBatch = function(render) {
    /**
     * Host render
     * @type {uno.WebglRender}
     * @private
     */
    this._render = render;

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
    this._stateBlends = new Uint8Array(this._maxSpriteCount);

    /**
     * Last blend mode added to states
     * @type {Number}
     * @private
     */
    this._stateBlendLast = -1;

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

    this._free();

    this.texture = null;
    this._indices = null;
    this._vertices = null;
    this._positions = null;
    this._colors = null;
    this._render = null;
    this._states = null;
    this._stateBlends = null;

    var textures = this._stateTextures;
    for (var i = 0, l = textures.length; i < l; ++i)
        textures[i] = null;
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
 * Free buffers
 * @private
 */
uno.WebglBatch.prototype._free = function() {
    var ctx = this._render._context;
    ctx.deleteBuffer(this._vertexBuffer);
    ctx.deleteBuffer(this._indexBuffer);
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglBatch.prototype._lose = function() {
    this._free();
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglBatch.prototype._restore = function() {
    var ctx = this._render._context;
    var consts = uno.WebglConsts;
    this._vertexBuffer = ctx.createBuffer();
    this._indexBuffer = ctx.createBuffer();

    ctx.bindBuffer(consts.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(consts.ARRAY_BUFFER, this._vertexBuffer);
    ctx.bufferData(consts.ELEMENT_ARRAY_BUFFER, this._indices, consts.STATIC_DRAW);
    ctx.bufferData(consts.ARRAY_BUFFER, this._vertices, consts.DYNAMIC_DRAW);

    this._stateTextures.length = 0;
};

/**
 * Add sprite to batch queue
 * @param {uno.WebglTexture} texture - WebGL texture instance
 * @param {Number} x - The x-coordinate of the texture frame
 * @param {Number} y - The x-coordinate of the texture frame
 * @param {Number} width - The width of the texture frame
 * @param {Number} height - The height of the texture frame
 * @param {uno.Color} tint - The texture tint color
 */
uno.WebglBatch.prototype.draw = function(texture, x, y, width, height, tint) {
    var state = this._render._state;
    var transform = state.transform;
    var tw = texture.texture.width;
    var th = texture.texture.height;
    var render = this._render;
    var a = transform.a;
    var b = transform.c;   // TODO: why we flip values?
    var c = transform.b;
    var d = transform.d;
    var tx = transform.tx;
    var ty = transform.ty;

    // Using packing ABGR (alpha and tint color)
    var color = tint.packABGR(state.alpha);
    var i = this._spriteCount * this._spriteSize;
    var vp = this._positions;
    var vc = this._colors;

    var u0;
    var v0;
    var u1;
    var v1;

    u0 = x / tw;
    u1 = u0 + width;

    if (texture.hasHandle(render, true)) {
        v1 = y / th;
        v0 = v1 + height;
    } else {
        v0 = y / th;
        v1 = v0 + height;
    }

    width *= tw;
    height *= th;

    vp[i++] = tx;
    vp[i++] = ty;
    vp[i++] = u0;
    vp[i++] = v0;
    vc[i++] = color;

    vp[i++] = a * width + tx;
    vp[i++] = b * width + ty;
    vp[i++] = u1;
    vp[i++] = v0;
    vc[i++] = color;

    vp[i++] = a * width + c * height + tx;
    vp[i++] = d * height + b * width + ty;
    vp[i++] = u1;
    vp[i++] = v1;
    vc[i++] = color;

    vp[i++] = c * height + tx;
    vp[i++] = d * height + ty;
    vp[i++] = u0;
    vp[i++] = v1;
    vc[i++] = color;

    ++this._spriteCount;
    this._saveState(texture.handle(render), state.blend);
    if (this._spriteCount >= this._maxSpriteCount)
        this.flush();
};

/**
 * Reset sprite batch
 */
uno.WebglBatch.prototype.reset = function() {
    var states = this._stateTextures;

    // Clear all links to textures
    for (var i = 0, l = this._stateCount; i < l; ++i)
        states[i] = null;

    this._stateTextureLast = null;

    this._stateBlendLast = uno.Render.BLEND_NORMAL;
    this._stateCount = 0;
    this._spriteCount = 0;
};

function setCoords(transform, mask, shader) {
    var auv = new uno.Point(0, 0);
    var buv = new uno.Point(1, 0);
    var cuv = new uno.Point(0, 1);

    var a = new uno.Point(0, 0);
    var b = new uno.Point(mask.width, 0);
    var c = new uno.Point(0, mask.height);

    transform.apply(a);
    transform.apply(b);
    transform.apply(c);

    var AB = new uno.Point(b.x - a.x, b.y - a.y);
    var AC = new uno.Point(c.x - a.x, c.y - a.y);

    var v = 1 / (AB.x * AC.y - AB.y * AC.x);

    AB.multiply(v);
    AC.multiply(v);

    var ac = new uno.Point(AC.x * a.y - AC.y * a.x, -(AB.x * a.y - AB.y * a.x));

    AB.multiply(-1);

    AB.x *= -1;
    AC.x *= -1;

    var dAB = new uno.Point(buv.x - auv.x, buv.y - auv.y);
    var dAC = new uno.Point(cuv.x - auv.x, cuv.y - auv.y);

    shader.uMaskUV.set([ac.x, AC.y, AC.x, ac.y, AB.y, AB.x, auv.x, dAB.x, dAC.x, auv.y, dAB.y, dAC.y]);

    shader.uClip.set([0, 0, 1, 1]);
}

/**
 * Render all current batched textures and free batch buffers
 * @returns {Boolean} - Is rendered anything
 */
uno.WebglBatch.prototype.flush = function() {
    if (!this._spriteCount)
        return false;

    var render = this._render;
    var state = render._state;
    var ctx = render._context;
    var consts = uno.WebglConsts;

    ctx.bindBuffer(consts.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(consts.ARRAY_BUFFER, this._vertexBuffer);

    // TODO: Refactor set/get shader and uniforms cache
    var shader = render._useShader(render._mask ? uno.WebglShader.SPRITE_MASK : uno.WebglShader.SPRITE);
    shader.uProjection.set(render._projection);

    if (render._mask) {
        shader.uMask.set(uno.WebglTexture.get(render._mask).handle(render), 1);
        setCoords(render._maskTransform, render._mask, shader);
    }

    // TODO: Check perfomance & gc
    // If batch have size more than max half send it all to GPU, otherwise send subarray (minimize send size)
    if (this._spriteCount > this._maxSpriteCount * 0.5)
        ctx.bufferSubData(consts.ARRAY_BUFFER, 0, this._vertices);
    else
        ctx.bufferSubData(consts.ARRAY_BUFFER, 0, this._positions.subarray(0, this._spriteCount * this._spriteSize));

    var states = this._states;
    var modes = this._stateBlends;
    var textures = this._stateTextures;
    var uniform = shader.uTexture;
    var index = 0;
    var count = 0;
    var texture, current = null;

    for (var i = 0, l = this._stateCount; i < l; ++i) {
        state.blend = modes[i];
        state.sync();

        texture = textures[i];
        if (texture !== current) {
            uniform.set(texture, 0);
            current = texture;
        }

        count = states[i];
        ctx.drawElements(consts.TRIANGLES, count - index, consts.UNSIGNED_SHORT, index * 2);
        index = count;
    }

    this.reset();
};

/**
 * Save texture and blend mode state for batching
 * @param {WebGLTexture} texture - Changed texture
 * @param {Number} blend - Changed blend mode. See {@link uno.Render} constants
 * @private
 */
uno.WebglBatch.prototype._saveState = function(texture, blend) {
    if (texture === this._stateTextureLast &&
        blend === this._stateBlendLast && this._stateCount) {
        this._states[this._stateCount - 1] = this._spriteCount * 6;
        return;
    }

    this._states[this._stateCount] = this._spriteCount * 6;
    this._stateTextures[this._stateCount] = texture;
    this._stateTextureLast = texture;
    this._stateBlends[this._stateCount] = blend;
    this._stateBlendLast = blend;

    ++this._stateCount;
};