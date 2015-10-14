/**
 * Canvas alpha mask helper
 * @constructor
 * @ignore
 */
uno.CanvasMask = function(render) {
    /**
     * Mask render
     * @type {uno.CanvasRender}
     * @private
     */
    this._render = render;

    /**
     * Mask texture
     * @type {uno.Texture}
     * @private
     */
    this._texture = null;

    /**
     * Mask fullscreen buffer
     * @type {uno.Texture}
     * @private
     */
    this._buffer = null;

    /**
     * Mask transform
     * @type {uno.Matrix}
     * @private
     */
    this._transform = new uno.Matrix();

    /**
     * Mask frame
     * @type {uno.Rect}
     * @private
     */
    this._frame = new uno.Rect();

    /**
     * Full mask frame
     * @type {uno.Rect}
     * @private
     */
    this._full = new uno.Rect();
};

/**
 * Destroy mask helper
 */
uno.CanvasMask.prototype.destroy = function() {
    this._texture = null;
    this._buffer = null;
    this._transform = null;
    this._frame = null;
};

/**
 * Check is mask enabled
 * @returns {Boolean}
 */
uno.CanvasMask.prototype.exist = function() {
    return !!(this._texture && this._buffer);
};

/**
 * Setup mask
 * @param {uno.Texture} texture - Texture for alpha mask
 * @param {uno.Matrix} transform - Transform of the mask
 * @param {uno.Rect} [frame] - The frame to mask rect of the texture (default full texture)
 */
uno.CanvasMask.prototype.set = function(texture, transform, frame) {
    if (!texture || !texture.ready) {
        if (this._texture && this._buffer)
            this.apply();
        this._texture = null;
        return true;
    }

    frame = frame || this._full.set(0, 0, texture.width, texture.height);

    if (this._texture !== texture || !this._transform.equal(transform) || !this._frame.equal(frame)) {
        if (this._texture && this._buffer)
            this.apply();
        this._texture = texture;
        this._transform.set(transform);
        this._frame.set(frame);
    }

    if (!this._buffer)
        this._buffer = new uno.Texture.create(this._render.width, this._render.height);

    this._render._setTarget(this._buffer);
};

/**
 * Resize mask buffer
 * @param {Number} width - New width of the render
 * @param {Number} height - New height of the render
 */
uno.CanvasMask.prototype.resize = function(width, height) {
    if (this._buffer && (this._buffer.width !== width || this._buffer.height !== height)) {
        this._buffer.destroy();
        this._buffer = new uno.Texture(width, height);
    }
};

uno.CanvasMask.prototype.clear = function(color) {
    var render = this._render;
    var temp = this._texture;

    this._texture = null;

    render.clear(uno.Color.TRANSPARENT);
    render._setTarget(render._target);
    render.clear(color);
    render._setTarget(this._buffer);

    this._texture = temp;
};

uno.CanvasMask.prototype.clip = function(x, y, width, height) {
    var render = this._render;
    var temp = this._texture;

    this._texture = null;

    render._setTarget(render._target);
    render.clip(x, y, width, height);
    render._setTarget(this._buffer);

    this._texture = temp;
};

/**
 * Apply mask to canvas
 */
uno.CanvasMask.prototype.apply = function() {
    var render = this._render;
    var state = render._state;

    // Clip alpha mask
    state.save();
    state.transform.set(this._transform);
    state.alpha = 1;
    state.blend = uno.CanvasState.BLEND_MASK;
    render.texture(this._texture, this._frame);
    state.restore();

    // Draw masked buffer to current target
    render._setTarget(render._target);
    state.save();
    state.reset();
    render.texture(this._buffer);
    state.restore();

    // Clear mask
    this._texture = null;
    render._setTarget(this._buffer);
    render.clear(uno.Color.TRANSPARENT);
    render._setTarget(render._target);
};