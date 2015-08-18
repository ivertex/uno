/**
 * WebGL alpha mask helper
 * @constructor
 * @ignore
 */
uno.WebglMask = function(render) {
    /**
     * Mask render
     * @type {uno.WebglRender}
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
     * Mask calculated UV vectors (4 3d vectors)
     * @type {Float32Array}
     * @private
     */
    this._uv = new Float32Array(12);

    // Helpers to prevent GC

    this._a = new uno.Point();
    this._b = new uno.Point();
    this._c = new uno.Point();
    this._auv = new uno.Point();
    this._buv = new uno.Point();
    this._cuv = new uno.Point();
    this._ab = new uno.Point();
    this._ac = new uno.Point();
    this._abc = new uno.Point();
    this._dab = new uno.Point();
    this._dac = new uno.Point();
};

/**
 * Destroy mask helper
 */
uno.WebglMask.prototype.destroy = function() {
    this._texture = null;
    this._transform = null;
    this._frame = null;
};

/**
 * Check is mask enabled
 * @returns {Boolean}
 */
uno.WebglMask.prototype.enable = function() {
    return !!this._texture && this._texture.ready;
};

/**
 * Setup mask
 * @param {uno.Texture} texture - Texture for alpha mask
 * @param {uno.Matrix} transform - Transform of the mask
 * @param {uno.Rect} frame - The frame to mask rect of the texture (default full texture)
 * @returns {Boolean}
 */
uno.WebglMask.prototype.set = function(texture, transform, frame) {
    var changed = false;
    var render = this._render;

    if (this._texture !== texture) {
        render._graphics.flush();
        render._sprites.flush();
        this._texture = texture;
    }

    if (transform !== undefined && !this._transform.equal(transform)) {
        this._transform.set(transform);
        changed = true;
    }

    if (frame !== undefined && !this._frame.equal(frame)) {
        if (texture)
            this._frame.set(frame.x / texture.width, frame.y / texture.height, frame.width / texture.width, frame.height / texture.height);
        changed = true;
    } else {
        this._frame.set(0, 0, 1, 1);
    }

    if (changed) {
        render._graphics.flush();
        render._sprites.flush();
    }

    if (changed && texture)
        this._calc();

    return changed;
};

/**
 * Apply mask shader uniforms
 * @param {uno.WebglShader} shader - Current mask shader
 */
uno.WebglMask.prototype.apply = function(shader, unit) {
    shader.uMask.set(uno.WebglTexture.get(this._texture).handle(this._render), unit || 0);
    shader.uMaskUV.set(this._uv);
    shader.uMaskClip.set(this._frame);
};

/**
 * Calculate UV coordinates for mask texture
 * @private
 */
uno.WebglMask.prototype._calc = function() {
    var texture = this._texture;
    var transform = this._transform;

    var a = this._a.set(0, 0);
    var b = this._b.set(texture.width, 0);
    var c = this._c.set(0, texture.height);

    var auv = this._auv.set(0, 0);
    var buv = this._buv.set(1, 0);
    var cuv = this._cuv.set(0, 1);

    transform.apply(a);
    transform.apply(b);
    transform.apply(c);

    var ab = this._ab.set(b.x - a.x, b.y - a.y);
    var ac = this._ac.set(c.x - a.x, c.y - a.y);

    var v = 1 / (ab.x * ac.y - ab.y * ac.x);

    ab.multiply(v);
    ac.multiply(v);

    var abc = this._abc.set(ac.x * a.y - ac.y * a.x, ab.y * a.x - ab.x * a.y);

    ab.multiply(-1);

    ab.x *= -1;
    ac.x *= -1;

    var dab = this._dab.set(buv.x - auv.x, buv.y - auv.y);
    var dac = this._dac.set(cuv.x - auv.x, cuv.y - auv.y);

    var uv = this._uv;

    uv[0] = abc.x;
    uv[1] = ac.y;
    uv[2] = ac.x;

    uv[3] = abc.y;
    uv[4] = ab.y;
    uv[5] = ab.x;

    uv[6] = auv.x;
    uv[7] = dab.x;
    uv[8] = dac.x;

    uv[9] = auv.y;
    uv[10] = dab.y;
    uv[11] = dac.y;
};