/**
 * Canvas context state helper
 * @constructor
 */
uno.WebglState = function(render) {
    var def = uno.Render.DEFAULT;

    this.context = render._context;

    this.transform = new uno.Matrix();
    this._transform = new uno.Matrix();
    this.__transform = new uno.Matrix();

    this.alpha = def.alpha;
    this._alpha = def.alpha;
    this.__alpha = def.alpha;

    this.blend = def.blend;
    this._blend = def.blend;
    this.__blend = def.blend;

    this.scale = def.scale;
    this._scale = def.scale;
    this.__scale = def.scale;

    this.fill = def.fill.clone();
    this._fill = def.fill.clone();
    this.__fill = def.fill.clone();

    this.stroke = def.stroke.clone();
    this._stroke = def.stroke.clone();
    this.__stroke = def.stroke.clone();

    this.thickness = def.thickness;
    this._thickness = def.thickness;
    this.__thickness = def.thickness;

    if (!uno.WebglState._inited) {
        uno.WebglState._initBlending(this.context);
        uno.WebglState._inited = true;
    }

    this.sync(true);
};

/**
 * Destroy state helper
 */
uno.WebglState.prototype.destroy = function() {
    this.context = null;

    this.transform = null;
    this._transform = null;
    this.__transform = null;

    this.fill = null;
    this._fill = null;
    this.__fill = null;

    this.stroke = null;
    this._stroke = null;
    this.__stroke = null;
};

/**
 * Sync state with context
 * @param {Boolean} force - Do not check state before
 */
uno.WebglState.prototype.sync = function(force) {
    var ctx = this.context;
    var current, tmp;

    current = this.blend;
    if (current !== this._blend || force) {
        tmp = uno.WebglState.BLEND_MODES[current];
        if (tmp) {
            ctx.blendFunc(tmp[0], tmp[1]);
            this._blend = current;
        }
    }

    return this;
};

/**
 * Set state to defaults and sync
 */
uno.WebglState.prototype.reset = function() {
    var def = uno.Render.DEFAULT;

    this.transform.reset();
    this.alpha = 1;
    this.blend = uno.Render.BLEND_NORMAL;
    this.scale = uno.Render.SCALE_LINEAR;
    this.fill.set(def.fill);
    this.stroke.set(def.stroke);
    this.thickness = def.thickness;

    return this;
};

/**
 * Save current state
 */
uno.WebglState.prototype.save = function() {
    this.__transform.set(this.transform);
    this.__alpha = this.alpha;
    this.__blend = this.blend;
    this.__scale = this.scale;
    this.__fill.set(this.fill);
    this.__stroke.set(this.stroke);
    this.__thickness = this.thickness;

    return this;
};

/**
 * Restore saved state
 */
uno.WebglState.prototype.restore = function() {
    this.transform.set(this.__transform);
    this.alpha = this.__alpha;
    this.blend = this.__blend;
    this.scale = this.__scale;
    this.fill.set(this.__fill);
    this.stroke.set(this.__stroke);
    this.thickness = this.__thickness;

    return this;
};

/**
 * Initialize WebGL blend modes
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @private
 */
uno.WebglState._initBlending = function(ctx) {
    var result = [];

    result[uno.Render.BLEND_NONE]       = [ctx.ONE, ctx.ZERO];
    result[uno.Render.BLEND_NORMAL]     = [ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA];
    result[uno.Render.BLEND_ADD]        = [ctx.ONE, ctx.ONE];
    result[uno.Render.BLEND_MULTIPLY]   = [ctx.DST_COLOR, ctx.ONE_MINUS_SRC_ALPHA];
    result[uno.Render.BLEND_SCREEN]     = [ctx.ONE, ctx.ONE_MINUS_SRC_COLOR];

    uno.WebglState.BLEND_MODES = result;
};

/**
 * List of supported blend modes
 * @type {Array}
 */
uno.WebglState.BLEND_MODES = [];