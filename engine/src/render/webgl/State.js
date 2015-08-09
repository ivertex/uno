/**
 * Canvas context state helper
 * @constructor
 */
uno.WebglState = function(render) {
    var def = uno.Render.DEFAULT;

    /**
     * Current canvas rendering context
     * @type {WebGLRenderingContext}
     * @private
     */
    this._render = render;

    /**
     * Current matrix transform
     * @type {uno.Matrix}
     */
    this.transform = new uno.Matrix();

    /**
     * Previous matrix transform
     * @type {uno.Matrix}
     * @private
     */
    this._transform = new uno.Matrix();

    /**
     * Temp matrix transform
     * @type {uno.Matrix}
     * @private
     */
    this.__transform = new uno.Matrix();

    /**
     * Current alpha
     * @type {Number}
     */
    this.alpha = def.alpha;

    /**
     * Previous alpha
     * @type {Number}
     * @private
     */
    this._alpha = def.alpha;

    /**
     * Temp alpha
     * @type {Number}
     * @private
     */
    this.__alpha = def.alpha;

    /**
     * Current blend mode
     * @type {Number}
     */
    this.blend = def.blend;

    /**
     * Previous blend mode
     * @type {Number}
     * @private
     */
    this._blend = def.blend;

    /**
     * Temp blend mode
     * @type {Number}
     * @private
     */
    this.__blend = def.blend;

    /**
     * Current scale mode
     * @type {Number}
     */
    this.scale = def.scale;

    /**
     * Previous scale mode
     * @type {Number}
     * @private
     */
    this._scale = def.scale;

    /**
     * Temp scale mode
     * @type {Number}
     * @private
     */
    this.__scale = def.scale;

    /**
     * Current fill color
     * @type {uno.Color}
     */
    this.fill = def.fill.clone();

    /**
     * Previous fill color
     * @type {uno.Color}
     * @private
     */
    this._fill = def.fill.clone();

    /**
     * Temp fill color
     * @type {uno.Color}
     * @private
     */
    this.__fill = def.fill.clone();

    /**
     * Current fill color
     * @type {uno.Color}
     */
    this.stroke = def.stroke.clone();

    /**
     * Previous fill color
     * @type {uno.Color}
     * @private
     */
    this._stroke = def.stroke.clone();

    /**
     * Temp fill color
     * @type {uno.Color}
     * @private
     */
    this.__stroke = def.stroke.clone();

    /**
     * Current stroke width
     * @type {Number}
     */
    this.thickness = def.thickness;

    /**
     * Previous stroke width
     * @type {Number}
     * @private
     */
    this._thickness = def.thickness;

    /**
     * Temp stroke width
     * @type {Number}
     * @private
     */
    this.__thickness = def.thickness;

    if (!uno.WebglState._inited) {
        uno.WebglState._initBlending(render._context);
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
    var ctx = this._render._context;
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
    var consts = uno.WebglConsts;

    result[uno.Render.BLEND_NORMAL]     = [consts.ONE, consts.ONE_MINUS_SRC_ALPHA];
    result[uno.Render.BLEND_ADD]        = [consts.ONE, consts.ONE];
    result[uno.Render.BLEND_MULTIPLY]   = [consts.DST_COLOR, consts.ONE_MINUS_SRC_ALPHA];
    result[uno.Render.BLEND_SCREEN]     = [consts.ONE, consts.ONE_MINUS_SRC_COLOR];

    uno.WebglState.BLEND_MODES = result;
};

/**
 * List of supported blend modes
 * @type {Array}
 */
uno.WebglState.BLEND_MODES = [];