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
 * Resize viewport
 * @param {Number} width - New width of the viewport
 * @param {Number} height - New width of the viewport
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;
    this._canvas.width = width;
    this._canvas.height = height;
    this._updateBounds();
    return this;
};

/**
 * Get bounds of render
 * For browser bounds is position and size on page
 * For other platforms position and size on screen
 * @returns {uno.Rect}
 */
uno.CanvasRender.prototype.bounds = function() {
    if (!this._boundsScroll.equal(uno.Screen.scrollX, uno.Screen.scrollY))
        this._updateBounds();
    return this._bounds;
};

/**
 * Free all allocated resources and destroy render
 */
uno.CanvasRender.prototype.destroy = function() {
    delete uno.Render.renders[this.id];
    this._context = null;
    this._canvas = null;
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
 * Set or reset render target texture
 * @param {uno.CanvasTexture} texture - Texture for render buffer
 */
uno.CanvasRender.prototype.target = function(texture) {
    if (!texture) {
        this._canvas = this._displayCanvas;
        this._context = this._displayContext;
        return;
    }
    var extension = uno.CanvasTexture.get(texture);
    this._canvas = extension.handle(this);
    this._context = extension.context();
};

/**
 * Clear viewport with color
 * @param {uno.Color} [color] - Color to fill viewport. If undefined {@link uno.WebglRender.clearColor} used
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.clear = function(color) {
    var ctx = this._context;
    this.blendMode(uno.Render.BLEND_NORMAL);
    this.transform(uno.Matrix.IDENTITY);
    if (this._transparent) {
        if (!color && this.clearColor === false)
            return this;
        ctx.clearRect(0, 0, this.width, this.height);
        return this;
    }
    if (!color)
        color = this.clearColor;
    if (!color || !color.a)
        return this;
    var graphics = this._graphics;
    var width = graphics.lineWidth();
    var fill = this._clearColorTemp.set(graphics.fillColor());
    graphics.fillColor(color);
    graphics.lineWidth(0);
    graphics.drawRect(0, 0, this.width, this.height);
    graphics.fillColor(fill);
    graphics.lineWidth(width);
    return this;
};

/**
 * Set current transform
 * @param {uno.Matrix} [matrix] - The new matrix transform
 * @returns {uno.Matrix} - Current matrix transform
 */
uno.CanvasRender.prototype.transform = function(matrix) {
    if (!matrix)
        return this._currentMatrix;
    if (this._hasResetTransform && matrix.identity())
        this._context.resetTransform();
    else
        this._context.setTransform(matrix.a, matrix.c, matrix.b, matrix.d, matrix.tx, matrix.ty);
    return this._currentMatrix.set(matrix);
};

/**
 * Set current blend mode
 * @param {Number} [mode] - The new blend mode. See {@link uno.Render} constants
 * @returns {Number} - Current blend mode
 */
uno.CanvasRender.prototype.blendMode = function(mode) {
    if (mode === undefined || this._currentBlendMode === mode || !uno.CanvasRender._blendModes)
        return this._currentBlendMode;
    if (!uno.CanvasRender._blendModes[mode])
        return this._currentBlendMode;
    this._context.globalCompositeOperation = uno.CanvasRender._blendModes[mode];
    return this._currentBlendMode = mode;
};

/**
 * Set current fill color for rendering graphics shapes
 * @param {uno.Color} [color] - The new fill color
 * @returns {uno.Color} - Current fill color
 */
uno.CanvasRender.prototype.fillColor = function(color) {
    return this._graphics.fillColor(color);
};

/**
 * Set current line color for rendering graphics shapes
 * @param {uno.Color} [color] - The new line color
 * @returns {uno.Color} - Current line color
 */
uno.CanvasRender.prototype.lineColor = function(color) {
    return this._graphics.lineColor(color);
};

/**
 * Set current line width for rendering graphics shapes
 * @param {Number} [width] - The new line width
 * @returns {Number} - Current line width
 */
uno.CanvasRender.prototype.lineWidth = function(width) {
    return this._graphics.lineWidth(width);
};

/**
 * Draw texture
 * @param {uno.Texture} texture - The texture to render
 * @param {uno.Frame} frame - The frame to render rect of the texture
 * @param {uno.Color} [tint=uno.Color.WHITE] - The texture tint color
 * @param {Number} [alpha=1] - Texture opacity
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawTexture = function(texture, frame, tint, alpha) {
    if (!texture.ready)
        return this;
    var ctx = this._context;
    this._setScaleMode(texture.scaleMode);
    this._setAlpha(alpha || 1);
    ctx.drawImage(
        (!tint || tint.equal(uno.Color.WHITE)) ? uno.CanvasTexture.get(texture).handle() : uno.CanvasTexture.get(texture).tint(tint),
        frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
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
    this._setAlpha(1);
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
    this._setAlpha(1);
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
    this._setAlpha(1);
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
    this._setAlpha(1);
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
    this._setAlpha(1);
    this._graphics.drawArc(x, y, radius, startAngle, endAngle, antiClockwise);
    return this;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawPoly = function(points) {
    this._setAlpha(1);
    this._graphics.drawPoly(points);
    return this;
};

/**
 * Draw previously created shape
 * @param {uno.Shape} shape - The shape created before
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawShape = function(shape) {
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
    this._clearColorTemp = new uno.Color();
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
    this._setAlpha(1);
    this._setScaleMode(uno.Render.SCALE_DEFAULT);
    this.blendMode(uno.Render.BLEND_NORMAL);
    this.transform(uno.Matrix.IDENTITY);
    var defaults = uno.Render.DEFAULT_GRAPHICS;
    this.fillColor(defaults.fillColor);
    this.lineColor(defaults.lineColor);
    this.lineWidth(defaults.lineWidth);
    if (this._autoClear)
        this.clear();
};

/**
 * Set opacity helper
 * @param {Number} alpha - Alpha value
 * @private
 */
uno.CanvasRender.prototype._setAlpha = function(alpha) {
    alpha = alpha || 1;
    if (this._currentAlpha === alpha)
        return;
    this._currentAlpha = alpha;
    this._context.globalAlpha = alpha;
};

/**
 * Set scale mode if image smooth property supported
 * @param {Number} scaleMode - See {@link uno.Render} constants
 * @private
 */
uno.CanvasRender.prototype._setScaleMode = function(scaleMode) {
    scaleMode = scaleMode || uno.Render.SCALE_DEFAULT;
    if (this._currentScaleMode === scaleMode || !uno.CanvasRender._smoothProperty)
        return;
    this._currentScaleMode = scaleMode;
    this._context[uno.CanvasRender._smoothProperty] = scaleMode === uno.Render.SCALE_LINEAR;
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