/**
 * Canvas render
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
 * @constructor
 */
uno.CanvasRender = function(settings) {
    /**
     * Type of render. See {@link uno.Render} constants
     * @type {Number}
     * @default uno.Render.RENDER_CANVAS
     */
    this.type = uno.Render.RENDER_CANVAS;

    /**
     * Root scene object
     * @type {uno.Object}
     */
    this.root = null;

    this._setupSettings(settings);
    this._setupProps();
    this._setupBounds();
    if (!this._createContext())
        return;
    this._setupViewport(settings);
    this._setupManagers();
    this._resetState();
    this._registerRender();
    this._setupFrame();
};

/**
 * Type the render. See {@link uno.Render} constants
 * @name uno.WebglRender#type
 * @type {Number}
 * @default uno.Render.RENDER_CANVAS
 * @readonly
 */
Object.defineProperty(uno.CanvasRender.prototype, 'type', {
    get: function () {
        return uno.Render.RENDER_CANVAS;
    }
});

/**
 * Width of the render
 * @name uno.CanvasRender#width
 * @type {Number}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'width', {
    get: function () {
        return this._width;
    },
    set: function(value) {
        if (value !== this._width)
            this.resize(value, this._height);
    }
});

/**
 * Height of the render
 * @name uno.CanvasRender#height
 * @type {Number}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'height', {
    get: function () {
        return this._height;
    },
    set: function(value) {
        if (value !== this._height)
            this.resize(this._width, value);
    }
});

/**
 * Get bounds of render<br>
 * For browser bounds is position and size on page<br>
 * For other platforms position and size on screen
 * @name uno.CanvasRender#bounds
 * @type {uno.Rect}
 * @readonly
 */
Object.defineProperty(uno.CanvasRender.prototype, 'bounds', {
    get: function() {
        if (!this._boundsScroll.equal(uno.Screen.scrollX, uno.Screen.scrollY))
            this._updateBounds();
        return this._bounds;
    }
});

/**
 * Set or reset render target texture
 * @name uno.CanvasRender#target
 * @type {uno.Texture}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'target', {
    get: function() {
        return this._target;
    },
    set: function(value) {
        if (!value) {
            if (this._target) {
                this._target = null;
                this._canvas = this._displayCanvas;
                this._context = this._displayContext;
                this._transformReset = true;
                this._scaleModeReset = true;
                //this._graphics.reset();
            }
        } else if (this._target !== value) {
            this._target = value;
            var extension = uno.CanvasTexture.get(value);
            this._canvas = extension.handle(this);
            this._context = extension.context();
            this._transformReset = true;
            this._scaleModeReset = true;
            //this._graphics.reset();
        }
    }
});

/**
 * Set current transform
 * @name uno.CanvasRender#transform
 * @type {uno.Matrix}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'transform', {
    get: function() {
        return this._currentMatrix;
    },
    set: function(value) {
        this._currentMatrix.set(value);
    }
});

/**
 * Set current alpha
 * @name uno.CanvasRender#alpha
 * @type {Number}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'alpha', {
    get: function() {
        return this._currentAlpha;
    },
    set: function(value) {
        if (this._currentAlpha === value)
            return;
        this._context.globalAlpha = value;
        this._currentAlpha = value;
    }
});

/**
 * Set current blend mode
 * @name uno.CanvasRender#blend
 * @type {Number}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'blend', {
    get: function() {
        return this._currentBlendMode;
    },
    set: function(value) {
        if (this._currentBlendMode === value || !uno.CanvasRender._blendModes[value])
            return;
        this._context.globalCompositeOperation = uno.CanvasRender._blendModes[value];
        this._currentBlendMode = value;
    }
});

/**
 * Current fill color
 * @name uno.CanvasRender#fillColor
 * @type {uno.Color}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'fillColor', {
    get: function() {
        return this._graphics.fillColor;
    },
    set: function(value) {
        if (!value) {
            this._graphics.fillColor.set(uno.Color.TRANSPARENT);
            return;
        }
        if (this._graphics.fillColor.equal(value))
            return;
        this._graphics.fillColor.set(value);
    }
});

/**
 * Current line color
 * @name uno.CanvasRender#lineColor
 * @type {uno.Color}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'lineColor', {
    get: function() {
        return this._graphics.lineColor;
    },
    set: function(value) {
        if (!value) {
            this._graphics.lineColor.set(uno.Color.TRANSPARENT);
            return;
        }
        if (this._graphics.lineColor.equal(value))
            return;
        this._graphics.lineColor.set(value);
    }
});

/**
 * Current line width
 * @name uno.CanvasRender#lineWidth
 * @type {Number}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'lineWidth', {
    get: function() {
        return this._graphics.lineWidth;
    },
    set: function(value) {
        if (!value || value < 0)
            value = 0;
        this._graphics.lineWidth = value;
    }
});

/**
 * Resize viewport
 * @param {Number} width - New width of the viewport
 * @param {Number} height - New width of the viewport
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.resize = function(width, height) {
    this._width = width;
    this._height = height;
    this._canvas.width = width;
    this._canvas.height = height;
    this._updateBounds();
    return this;
};

/**
 * Free all allocated resources and destroy render
 */
uno.CanvasRender.prototype.destroy = function() {
    delete uno.Render.renders[this.id];
    this._context = null;
    this._canvas = null;
    this._target = null;
    this._displayCanvas = null;
    this._displayContext = null;
    this._currentMatrix = null;
    this._clearColorTemp = null;
    this._bounds = null;
    this._boundsScroll = null;
    this._frameBind = null;
    this._graphics.destroy();
    this._graphics = null;
    this.root = null;
};

/**
 * Clear viewport with color
 * @param {uno.Color} [color] - Color to fill viewport. If undefined {@link uno.WebglRender.clearColor} used
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.clear = function(color) {
    var ctx = this._context;

    if (this._transparent) {
        if (!color && this.clearColor === false)
            return this;
        ctx.clearRect(0, 0, this._width, this._height);
        return this;
    }

    if (!color)
        color = this.clearColor;

    if (!color || !color.a)
        return this;

    var graphics = this._graphics;
    var alpha = this._currentAlpha;
    var blend = this._currentBlendMode;
    var width = graphics.lineWidth;
    var fill = this._clearColorTemp.set(graphics.fillColor);

    this._setTransform();
    this.blend = uno.Render.BLEND_NORMAL;
    this.alpha = 1;

    graphics.fillColor.set(color);
    graphics.lineWidth = 0;
    graphics.drawRect(0, 0, this._width, this._height);
    graphics.fillColor.set(fill);
    graphics.lineWidth = width;

    this._setTransform(this._currentMatrix);
    this.blend = blend;
    this.alpha = alpha;

    return this;
};

/**
 * Draw texture
 * @param {uno.Texture} texture - The texture to render
 * @param {uno.Rect} [frame] - The frame to render rect of the texture (default full texture)
 * @param {uno.Color} [tint=uno.Color.WHITE] - The texture tint color
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawTexture = function(texture, frame, tint) {
    if (!texture.ready)
        return this;
    var ctx = this._context;
    this._setScaleMode(texture.scaleMode);
    this._setTransform(this._currentMatrix);
    ctx.drawImage(
        (!tint || tint.equal(uno.Color.WHITE)) ? uno.CanvasTexture.get(texture).handle() : uno.CanvasTexture.get(texture).tint(tint),
        frame ? frame.x : 0, frame ? frame.y : 0, frame ? frame.width : texture.width, frame ? frame.height : texture.height,
        0, 0, frame ? frame.width : texture.width, frame ? frame.height : texture.height);
    return this;
};

/**
 * Draw line
 * @param {Number} x1 - The x-coordinate of the first point of the line
 * @param {Number} y1 - The y-coordinate of the first point of the line
 * @param {Number} x2 - The x-coordinate of the second point of the line
 * @param {Number} y2 - The y-coordinate of the second point of the line
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawLine = function(x1, y1, x2, y2) {
    this._setTransform(this._currentMatrix);
    this._graphics.drawLine(x1, y1, x2, y2);
    return this;
};

/**
 * Draw rectangle
 * @param {Number} x - The x-coordinate of the left-top point of the rect
 * @param {Number} y - The y-coordinate of the left-top point of the rect
 * @param {Number} width - The rectangle width
 * @param {Number} height - The rectangle height
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawRect = function(x, y, width, height) {
    this._setTransform(this._currentMatrix);
    this._graphics.drawRect(x, y, width, height);
    return this;
};

/**
 * Draw circle
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawCircle = function(x, y, radius) {
    this._setTransform(this._currentMatrix);
    this._graphics.drawCircle(x, y, radius);
    return this;
};

/**
 * Draw ellipse
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawEllipse = function(x, y, width, height) {
    this._setTransform(this._currentMatrix);
    this._graphics.drawEllipse(x, y, width, height);
    return this;
};

/**
 * Draw arc
 * @param {Number} x - The x-coordinate of the center of the arc
 * @param {Number} y - The y-coordinate of the center of the arc
 * @param {Number} radius - The radius of the arc
 * @param {Number} startAngle - The starting angle, in radians
 * @param {Number} endAngle - The ending angle, in radians
 * @param {Boolean} antiClockwise - Specifies whether the drawing should be counterclockwise or clockwise
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawArc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    this._setTransform(this._currentMatrix);
    this._graphics.drawArc(x, y, radius, startAngle, endAngle, antiClockwise);
    return this;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawPoly = function(points) {
    this._setTransform(this._currentMatrix);
    this._graphics.drawPoly(points);
    return this;
};

/**
 * Draw previously created shape
 * @param {uno.Shape} shape - The shape created before
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawShape = function(shape) {
    this._setTransform(this._currentMatrix);
    this._graphics.drawShape(shape);
    return this;
};

/**
 * Start creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.CanvasRender.prototype.startShape = function() {
    return this._graphics.startShape();
};

/**
 * Finish creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.CanvasRender.prototype.endShape = function() {
    return this._graphics.endShape();
};

/**
 * Get texture pixels
 * @param {uno.Texture} texture - The texture to process
 * @param {Number} [x=0] - The x-coordinate of the extracted rect
 * @param {Number} [y=0] - The y-coordinate of the extracted rect
 * @param {Number} [width=Texture width] - The width of the extracted rect
 * @param {Number} [height=Texture height] - The height of the extracted rect
 * @returns {Uint8ClampedArray} - Don't save data, it is internal buffer, copy if need
 */
uno.CanvasRender.prototype.getPixels = function(texture, x, y, width, height) {
    return uno.CanvasTexture.get(texture).getPixels(x, y, width, height);
};

/**
 * Set texture pixels
 * @param {uno.Texture} texture - The texture to process
 * @param {Uint8ClampedArray} data - Pixels data
 * @param {Number} [x=0] - The x-coordinate of the extracted rect
 * @param {Number} [y=0] - The y-coordinate of the extracted rect
 * @param {Number} [width=Texture width] - The width of the extracted rect
 * @param {Number} [height=Texture height] - The height of the extracted rect
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.setPixels = function(texture, data, x, y, width, height) {
    uno.CanvasTexture.get(texture).setPixels(data, x, y, width, height);
    return this;
};

/**
 * Initialize settings properties helper
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
 * @private
 */
uno.CanvasRender.prototype._setupSettings = function(settings) {
    var def = uno.Render.DEFAULT_SETTINGS;
    if (!settings.canvas)
        return uno.error('Can not create render, settings.canvas is not defined');
    this.clearColor = settings.clearColor ? settings.clearColor.clone() : def.clearColor.clone();
    this.fps = settings.fps === 0 ? 0 : (settings.fps || def.fps);
    this.ups = settings.ups === 0 ? 0 : (settings.ups || def.ups);
    this._displayCanvas = this._canvas = settings.canvas;
    this._transparent = settings.transparent !== undefined ? !!settings.transparent : def.transparent;
    this._autoClear = settings.autoClear !== undefined ? !!settings.autoClear : def.autoClear;
    this._antialias = settings.antialias !== undefined ? !!settings.antialias : def.antialias;
    if (uno.Browser.ie) {
        this._canvas.style['-ms-content-zooming'] = 'none';
        this._canvas.style['-ms-touch-action'] = 'none';
    }
    if (!this._contextMenu)
        this._canvas.oncontextmenu = function() { return false; };
};

/**
 * Initialize render specific properties helper
 * @private
 */
uno.CanvasRender.prototype._setupProps = function() {
    this._currentMatrix = new uno.Matrix();
    this._contextMatrix = new uno.Matrix();
    this._transformReset = false;
    this._currentBlendMode = uno.Render.BLEND_NORMAL;
    this._currentScaleMode = uno.Render.SCALE_DEFAULT;
    this._currentAlpha = 1;
    this._clearColorTemp = new uno.Color();
    this._target = null;
};

/**
 * Initialize the render bounds tracking
 * @private
 */
uno.CanvasRender.prototype._setupBounds = function() {
    this._bounds = new uno.Rect();
    this._boundsScroll = new uno.Point();
};

/**
 * Update render bounds
 * @private
 */
uno.CanvasRender.prototype._updateBounds = function() {
    var rect = this._canvas.getBoundingClientRect();
    this._bounds.set(rect.left, rect.top, rect.width, rect.height);
    this._boundsScroll.set(uno.Screen.scrollX, uno.Screen.scrollY);
};

/**
 * Create Canvas context
 * @private
 */
uno.CanvasRender.prototype._createContext = function() {
    var options = {
        alpha: this._transparent
    };
    this._displayContext = this._context = this._canvas.getContext ? this._canvas.getContext('2d', options) : null;
    if (!this._context)
        return uno.error('This browser does not support canvas. Try using another browser');
    this._hasResetTransform = !!this._context.resetTransform;
    uno.CanvasRender._initSmoothing(this._context);
    uno.CanvasRender._initBlendModes();
    return true;
};

/**
 * Initialize viewport size
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
 * @private
 */
uno.CanvasRender.prototype._setupViewport = function(settings) {
    var width = settings.width || uno.Screen.availWidth;
    var height = settings.height || uno.Screen.availHeight;
    this.resize(width, height);
};

/**
 * Initialize helpers
 * @private
 */
uno.CanvasRender.prototype._setupManagers = function() {
    this._graphics = new uno.CanvasGraphics(this);
};

/**
 * Register render in global list of renders
 * @private
 */
uno.CanvasRender.prototype._registerRender = function() {
    this.id = uno.Render._uid++;
    uno.Render.renders[this.id] = this;
};

/**
 * Initialize frame callback
 * @private
 */
uno.CanvasRender.prototype._setupFrame = function() {
    this._lastUpdateTime = 0;
    this._lastRenderTime = 0;
    this._frameBind = this._onFrame.bind(this);
    this._onFrame(0);
};

/**
 * Frame callback
 * @param {Number} time - RAF time
 * @private
 */
uno.CanvasRender.prototype._onFrame = function(time) {
    if (!this._frameBind)
        return;
    requestAnimationFrame(this._frameBind, this._canvas);
    var root = this.root;
    var udelta = time - this._lastUpdateTime;
    var rdelta = time - this._lastRenderTime;
    if (this.ups && root && root.update &&
        (this.ups === 60 || udelta >= (1 / this.ups) * 900)) {  // 90% percent of time per update and maximum for 60 ups
        root.update(this, udelta);
        this._lastUpdateTime = time;
    }
    if (this.fps && root && root.render &&
        (this.fps === 60 || rdelta >= (1 / this.fps) * 900)) { // 90% percent of time per render and maximum for 60 fps
        this._resetState();
        root.render(this, rdelta);
        this._lastRenderTime = time;
    }
};

/**
 * Reset render state after frame
 * @private
 */
uno.CanvasRender.prototype._resetState = function() {
    this.target = null;
    this.transform.reset();
    this.blend = uno.Render.BLEND_NORMAL;
    this.alpha = 1;

    var defaults = uno.Render.DEFAULT_GRAPHICS;
    this.fillColor = defaults.fillColor;
    this.lineColor = defaults.lineColor;
    this.lineWidth = defaults.lineWidth;

    if (this._autoClear)
        this.clear();
};

/**
 * Set transform for render
 * @param {uno.Matrix} matrix - New transform matrix
 * @private
 */
uno.CanvasRender.prototype._setTransform = function(matrix) {
    matrix = matrix || uno.Matrix.IDENTITY;
    if (!this._transformReset && this._contextMatrix.equal(matrix))
        return;
    if (this._hasResetTransform && matrix.identity())
        this._context.resetTransform();
    else
        this._context.setTransform(matrix.a, matrix.c, matrix.b, matrix.d, matrix.tx, matrix.ty);
    this._contextMatrix.set(matrix);
    this._transformReset = false;
};

/**
 * Set scale mode if image smooth property supported
 * @param {Number} scaleMode - See {@link uno.Render} constants
 * @private
 */
uno.CanvasRender.prototype._setScaleMode = function(scaleMode) {
    scaleMode = scaleMode || uno.Render.SCALE_DEFAULT;
    if (!this._scaleModeReset && this._currentScaleMode === scaleMode || !uno.CanvasRender._smoothProperty)
        return;
    this._context[uno.CanvasRender._smoothProperty] = scaleMode === uno.Render.SCALE_LINEAR;
    this._currentScaleMode = scaleMode;
    this._scaleModeReset = false;
};

/**
 * Check for support new blend modes in Canvas context
 * @returns {Boolean}
 * @private
 */
uno.CanvasRender._blendModesSupported = function() {
    if (uno.CanvasRender._blendModesSupport !== undefined)
        return uno.CanvasRender._blendModesSupport;
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1, 1);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 1, 1);
    uno.CanvasRender._blendModesSupport = ctx.getImageData(0, 0, 1, 1).data[0] === 0;
    return uno.CanvasRender._blendModesSupport;
};

/**
 * Initialize Canvas blend modes
 * @private
 */
uno.CanvasRender._initBlendModes = function() {
    if (uno.CanvasRender._blendModes)
        return;
    var supported = this._blendModesSupported();
    var result = {};
    result[uno.Render.BLEND_NONE]       = 'source-over';
    result[uno.Render.BLEND_NORMAL]     = 'source-over';
    result[uno.Render.BLEND_ADD]        = 'lighter';
    result[uno.Render.BLEND_MULTIPLY]   = supported ? 'multiply' : 'source-over';
    result[uno.Render.BLEND_SCREEN]     = supported ? 'screen' : 'source-over';
    uno.CanvasRender._blendModes = result;
};

/**
 * Initialize canvas image smoothing property
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @private
 */
uno.CanvasRender._initSmoothing = function(ctx) {
    if (uno.CanvasRender._smoothProperty !== undefined)
        return;
    uno.CanvasRender._smoothProperty = false;
    var vendor = ['', 'webkit', 'moz', 'o'];
    for (var i = 0, l = vendor.length; i < l && !this._smoothProperty; ++i) {
        var property = vendor[i] + 'imageSmoothingEnabled';
        if (property in ctx)
            uno.CanvasRender._smoothProperty = property;
    }
};