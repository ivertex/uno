/**
 * Canvas context state helper
 * @constructor
 */
uno.CanvasState = function(render) {
    var def = uno.Render.DEFAULT;

    /**
     * Current canvas rendering context
     * @type {CanvasRenderingContext2D}
     */
    this.context = render._context;

    /**
     * Previous canvas rendering context
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._context = render._context;

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

    if (!uno.CanvasState._inited) {
        uno.CanvasState._initBlending();
        uno.CanvasState._initSmoothing();
        uno.CanvasState._inited = true;
    }
};

/**
 * Destroy state helper
 */
uno.CanvasState.prototype.destroy = function() {
    this.context = null;
    this._context = null;

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
 * @param {Boolean} [force] - Do not check state before
 */
uno.CanvasState.prototype.sync = function(force) {
    var current, last, temp;
    var ctx = this.context;

    force = force || ctx !== this._context;
    this._context = ctx;

    if (!ctx)
        return;

    current = this.transform;
    last = this._transform;
    if (force || !current.equal(last)) {
        if (this._reset === undefined)
            this._reset = !!ctx.resetTransform;

        if (this._reset && current.identity())
            ctx.resetTransform();
        else
            ctx.setTransform(current.a, current.c, current.b, current.d, current.tx, current.ty);
        last.set(current);
    }

    current = this.alpha;
    last = this._alpha;
    if (current !== last || (force && current !== ctx.globalAlpha)) {
        ctx.globalAlpha = current;
        this._alpha = current;
    }

    temp = uno.CanvasState.BLEND_MODES;
    current = this.blend;
    last = this._blend;
    if (current !== last || (force && temp[current] !== ctx.globalCompositeOperation)) {
        ctx.globalCompositeOperation = temp[current];
        this._blend = current;
    }

    temp = uno.CanvasState.SMOOTH_PROPERTY;
    current = this.scale;
    last = this._scale;
    if (current !== last || (force && ((current === uno.Render.SCALE_LINEAR) !== ctx[temp]))) {
        ctx[temp] = current === uno.Render.SCALE_LINEAR;
        this._scale = current;
    }

    current = this.fill;
    last = this._fill;
    if (!current.equal(last) || (force && current.cssRGBA !== ctx.fillStyle)) {
        ctx.fillStyle = current.cssRGBA;
        last.set(current);
    }

    current = this.stroke;
    last = this._stroke;
    if (!current.equal(last) || (force && current.cssRGBA !== ctx.strokeStyle)) {
        ctx.strokeStyle = current.cssRGBA;
        last.set(current);
    }

    current = this.thickness;
    last = this._thickness;
    if (current !== last || (force && current !== ctx.lineWidth)) {
        ctx.lineWidth = current;
        this._thickness = current;
    }
};

/**
 * Set state to defaults and sync
 * @param {Boolean} [force] - Force sync
 */
uno.CanvasState.prototype.reset = function(force) {
    var def = uno.Render.DEFAULT;

    this.transform.reset();
    this.alpha = 1;
    this.blend = uno.Render.BLEND_NORMAL;
    this.scale = uno.Render.SCALE_LINEAR;
    this.fill.set(def.fill);
    this.stroke.set(def.stroke);
    this.thickness = def.thickness;

    this.sync(force);
};

/**
 * Save current state
 */
uno.CanvasState.prototype.save = function() {
    this.__transform.set(this.transform);
    this.__alpha = this.alpha;
    this.__blend = this.blend;
    this.__scale = this.scale;
    this.__fill.set(this.fill);
    this.__stroke.set(this.stroke);
    this.__thickness = this.thickness;
};

/**
 * Restore saved state
 * @param {Boolean} [force] - Force sync
 */
uno.CanvasState.prototype.restore = function(force) {
    this.transform.set(this.__transform);
    this.alpha = this.__alpha;
    this.blend = this.__blend;
    this.scale = this.__scale;
    this.fill.set(this.__fill);
    this.stroke.set(this.__stroke);
    this.thickness = this.__thickness;

    this.sync(force);
};

/**
 * Check for support new blend modes in Canvas context
 * @returns {Boolean}
 * @private
 */
uno.CanvasState._blendExtended = function() {
    var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
    var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';

    var magenta = new Image();
    magenta.src = pngHead + 'AP804Oa6' + pngEnd;

    var yellow = new Image();
    yellow.src = pngHead + '/wCKxvRF' + pngEnd;

    var canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;

    var ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(magenta, 0, 0);
    ctx.drawImage(yellow, 2, 0);

    var data = ctx.getImageData(2, 0, 1, 1).data;
    return data[0] === 255 && data[1] === 0 && data[2] === 0;
};

/**
 * Set canvas blend modes
 * @private
 */
uno.CanvasState._initBlending = function() {
    var supported = this._blendExtended();
    var result = [];

    result[uno.Render.BLEND_NORMAL]     = 'source-over';
    result[uno.Render.BLEND_ADD]        = 'lighter';
    result[uno.Render.BLEND_MULTIPLY]   = supported ? 'multiply' : 'source-over';
    result[uno.Render.BLEND_SCREEN]     = supported ? 'screen' : 'source-over';

    // For internal purposes
    result[uno.CanvasState.BLEND_MASK]  = 'destination-in';

    uno.CanvasState.BLEND_EXTENDED = supported;
    uno.CanvasState.BLEND_MODES = result;
};

/**
 * Get canvas image smoothing property
 * @private
 */
uno.CanvasState._initSmoothing = function() {
    var image = document.createElement('canvas');
    var ctx = image.getContext('2d');
    var vendor = ['', 'ms', 'webkit', 'moz', 'o'];
    var prop;

    for (var i = 0, l = vendor.length; i < l; ++i) {
        prop = vendor[i] + 'imageSmoothingEnabled';
        if (prop in ctx) {
            uno.CanvasRender.SMOOTH_PROPERTY = prop;
            break;
        }
    }
};


/**
 * Is additional (multiply, screen) blend modes supported
 * @type {boolean}
 */
uno.CanvasState.BLEND_EXTENDED = false;

/**
 * List of supported blend modes
 * @type {Array}
 */
uno.CanvasState.BLEND_MODES = [];

/**
 * Mask blend value
 * @const {Number}
 */
uno.CanvasState.BLEND_MASK = -1;

/**
 * Name of property 'imageSmoothingEnabled' in context for enabling/disabling smoothing
 * @type {Boolean|String}
 */
uno.CanvasState.SMOOTH_PROPERTY = false;