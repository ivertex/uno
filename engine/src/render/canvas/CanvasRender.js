/**
 * Canvas render
 * @param {Object} settings - See {@link uno.Render.DEFAULT}
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

    this._setupManagers();
    this._setupViewport(settings);
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
        if (this.mask)
            this.mask = false;
        if (!value) {
            if (this._target) {
                this._target = null;
                this._changeTarget(null);
            }
        } else if (this._target !== value) {
            this._target = value;
            this._changeTarget(value);
        }
    }
});

/**
 * Set or reset mask texture
 * @name uno.CanvasRender#target
 * @type {uno.Texture}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'mask', {
    get: function() {
        return this._mask;
    },
    set: function(value) {
        if (!value) {
            this._applyMask();
            return;
        }
        if (this._mask && value !== this._mask) {
            this._applyMask();
        }
        if (value.ready === false || value === this._mask) {
            this._maskTransform.set(this._currentTransform);
            this._maskAlpha = this._currentAlpha;
            return;
        }
        if (!this._maskBuffer)
            this._maskBuffer = new uno.Texture.create(this._width, this._height);
        this._mask = value;
        this._maskTransform.set(this._currentTransform);
        this._maskAlpha = this._currentAlpha;
        this._changeTarget(this._maskBuffer);
    }
});

/**
 * Set current transform
 * @name uno.CanvasRender#transform
 * @type {uno.Matrix}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'transform', {
    get: function() {
        return this._currentTransform;
    },
    set: function(value) {
        this._currentTransform.set(value);
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
        return this._currentBlend;
    },
    set: function(value) {
        if (this._currentBlend === value || !uno.CanvasRender._blendModes[value])
            return;
        this._currentBlend = value;
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
    this._clip.set(0, 0, width, height);

    if (this._maskBuffer && (this._maskBuffer.width !== width || this._maskBuffer.height !== height))
        this._maskBuffer = new uno.Texture(width, height);

    this._updateBounds();

    // Canvas context is reset we should set states
    this._resetState(true);

    // Canvas is cleared we should rerender frame
    if (this.root)
        this.root.render(this, this._lastRenderTime);

    return this;
};

/**
 * Free all allocated resources and destroy render
 */
uno.CanvasRender.prototype.destroy = function() {
    var index = uno.Render.renders.indexOf(this);
    if (index === -1)
        return;
    uno.Render.renders.splice(index, 1);

    // Free managers
    this._graphics.destroy();
    this._graphics = null;

    this._context = null;
    this._canvas = null;
    this._target = null;
    this._displayCanvas = null;
    this._displayContext = null;
    this._currentTransform = null;
    this._tempTransform = null;
    this._bounds = null;
    this._boundsScroll = null;
    this._frameBind = null;
    this._mask = null;
    this._maskBuffer = null;
    this._maskTransform = null;

    this.root = null;
};

/**
 * Clear viewport with color
 * @param {uno.Color} [color] - Color to fill viewport. If undefined {@link uno.WebglRender.clearColor} used
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.clear = function(color) {
    var ctx = this._context;

    if (!color)
        color = this.background;

    if (color && !color.a) {
        this._tempState(uno.Matrix.IDENTITY, 1, uno.Render.BLEND_NORMAL);
        ctx.clearRect(0, 0, this._width, this._height);
        this._restoreState();
        return this;
    }

    if (!color)
        return this;

    var line = ctx.lineWidth;
    var fill = ctx.fillStyle;

    this._tempState(uno.Matrix.IDENTITY, 1, uno.Render.BLEND_NORMAL);

    if (line)
        ctx.lineWidth = 0;
    if (fill !== color.cssRGBA)
        ctx.fillStyle = color.cssRGBA;

    ctx.fillRect(0, 0, this._width, this._height);

    if (line)
        ctx.lineWidth = line;
    if (fill !== color.cssRGBA)
        ctx.fillStyle = fill;

    this._restoreState();

    return this;
};

/**
 * Clip viewport rect
 * @param {Number} x - The x-coordinate of the left-top point of the clip rect
 * @param {Number} y - The y-coordinate of the left-top point of the clip rect
 * @param {Number} width - The clip rectangle width
 * @param {Number} height - The clip rectangle height
 * @returns {uno.CanvasRender}
 */
uno.CanvasRender.prototype.clip = function(x, y, width, height) {
    var ctx = this._context;
    var clip = this._clip;
    var full = clip.x === 0 && clip.y === 0 && clip.width === this._width && clip.height === this._height;

    if (clip.x === x && clip.y === y && clip.width === width && clip.height === height) {
        return this;
    }

    if (x === undefined || x === false) {
        if (full)
            return this;
        clip.set(0, 0, this._width, this._height);
        ctx.restore();
        this._setState(this._currentTransform, this._currentAlpha, this._currentBlend, this._currentScale, true);
        return this;
    }

    if (!full) {
        ctx.restore();
        this._setState(this._currentTransform, this._currentAlpha, this._currentBlend, this._currentScale, true);
    }

    clip.set(x, y, width, height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

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
    if (!texture || !texture.ready || !this._currentAlpha)
        return this;

    this._setState(this._currentTransform, this._currentAlpha, this._currentBlend, texture.scaleMode);

    var ctx = this._context;
    var tex = uno.CanvasTexture.get(texture);

    if (!frame ||
        (frame.x >= 0 && frame.x <= texture.width - frame.width &&
        frame.y >= 0 && frame.y <= texture.height - frame.height)) {
        ctx.drawImage(tex.handle(tint), frame ? frame.x : 0, frame ? frame.y : 0,
            frame ? frame.width : texture.width, frame ? frame.height : texture.height,
            0, 0, frame ? frame.width : texture.width, frame ? frame.height : texture.height);
        return this;
    }

    // Tiled version here
    if (!texture.pot) {
        uno.error('Repeating non power of two textures are not supported');
        return this;
    }

    var fill = ctx.fillStyle;
    ctx.fillStyle = tex.pattern(this, tint);

    var px = frame.x % texture.width;
    var py = frame.y % texture.height;

    if (px !== 0 || py !== 0)
        ctx.translate(-px, -py);

    ctx.fillRect(px, py, frame.width, frame.height);

    if (px !== 0 || py !== 0)
        ctx.translate(px, py);

    ctx.fillStyle = fill;

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
    this._graphics.drawLine(this._currentTransform, x1, y1, x2, y2, this._currentAlpha, this._currentBlend);
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
    this._graphics.drawRect(this._currentTransform, x, y, width, height, this._currentAlpha, this._currentBlend);
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
    this._graphics.drawCircle(this._currentTransform, x, y, radius, this._currentAlpha, this._currentBlend);
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
    this._graphics.drawEllipse(this._currentTransform, x, y, width, height, this._currentAlpha, this._currentBlend);
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
    this._graphics.drawArc(this._currentTransform, x, y, radius, startAngle, endAngle, antiClockwise,
        this._currentAlpha, this._currentBlend);
    return this;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawPoly = function(points) {
    this._graphics.drawPoly(this._currentTransform, points, this._currentAlpha, this._currentBlend);
    return this;
};

/**
 * Draw previously created shape
 * @param {uno.Shape} shape - The shape created before
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawShape = function(shape) {
    this._graphics.drawShape(this._currentTransform, shape, this._currentAlpha);
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
    var w = texture ? texture.width : this.width;
    var h = texture ? texture.height : this.height;

    x = x || 0;
    y = y || 0;
    width = width || w;
    height = height || h;

    if (x < 0 || y < 0 || x + width > w || y + height > h)
        return null;

    var source = texture ? uno.CanvasTexture.get(texture) : this;

    if (texture)
        source._imageData = source.context().getImageData(x, y, width, height);
    else
        source._imageData = this._context.getImageData(x, y, width, height);

    return source._imageData.data;
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
    if (!texture) {
        uno.error('Set pixels to screen not supported, try to use texture');
        return this;
    }

    var w = texture.width;
    var h = texture.height;

    x = x || 0;
    y = y || 0;
    width = width || w;
    height = height || h;

    if (!data || width * height * 4 !== data.length)
        return this;

    if (x < 0 || y < 0 || x + width > w || y + height > h)
        return this;

    texture = uno.CanvasTexture.get(texture);

    var idata = texture._imageData;

    if (!idata)
        idata = texture._imageData = texture.context().getImageData(x, y, width, height);

    if (idata.data !== data)
        idata.data.set(data);

    texture.context().putImageData(idata, x, y);

    return this;
};

/**
 * Initialize settings properties helper
 * @param {Object} settings - See {@link uno.Render.DEFAULT}
 * @private
 */
uno.CanvasRender.prototype._setupSettings = function(settings) {
    var def = uno.Render.DEFAULT;

    if (!settings.canvas)
        return uno.error('Can not create render, settings.canvas is not defined');

    if (settings.background === false)
        this.background = false;
    else
        this.background = settings.background === undefined ? def.background.clone() : settings.background.clone();

    this.fps = settings.fps === 0 ? 0 : (settings.fps || def.fps);
    this.ups = settings.ups === 0 ? 0 : (settings.ups || def.ups);

    this._displayCanvas = this._canvas = settings.canvas;

    if (uno.Browser.ie) {
        this._canvas.style['-ms-content-zooming'] = 'none';
        this._canvas.style['-ms-touch-action'] = 'none';
    }

    if (!settings.contextMenu)
        this._canvas.oncontextmenu = function() { return false; };
};

/**
 * Initialize render specific properties helper
 * @private
 */
uno.CanvasRender.prototype._setupProps = function() {
    this._currentTransform = new uno.Matrix();
    this._contextTransform = new uno.Matrix();
    this._tempTransform = new uno.Matrix();
    this._currentBlend = uno.Render.BLEND_NORMAL;
    this._contextBlend = uno.Render.BLEND_NORMAL;
    this._currentScale = uno.Render.SCALE_DEFAULT;
    this._contextScale = uno.Render.SCALE_DEFAULT;
    this._currentAlpha = 1;
    this._contextAlpha = 1;
    this._target = null;
    this._clip = new uno.Rect(0, 0, this._width, this._height);
    this._mask = null;
    this._maskBuffer = null;
    this._maskTransform = new uno.Matrix();
    this._maskAlpha = 1;
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
 * @param {Object} settings - See {@link uno.Render.DEFAULT}
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
    uno.Render.renders.push(this);
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
        this.mask = false;
        this._lastRenderTime = time;
    }
};

/**
 * Reset render state before each frame
 * @private
 */
uno.CanvasRender.prototype._resetState = function(force) {
    this.target = null;
    this._currentTransform.reset();
    this._currentBlend = uno.Render.BLEND_NORMAL;
    this._currentAlpha = 1;
    this._currentScale = uno.Render.SCALE_DEFAULT;
    this._setState(this._currentTransform, this._currentAlpha, this._currentBlend, this._currentScale, force);

    if (this._graphics)
        this._graphics._resetState(force);

    this.clip();

    if (this.background)
        this.clear();
};

/**
 * Set graphics style
 * @param {uno.Matrix} [transform] - Transformation
 * @param {Number} [alpha] - Transparency
 * @param {Number} [blend] - Rendering blend mode
 * @param {Number} [scale] - Texture scale mode
 * @param {Boolean} [force=false] - Do not check cache
 * @private
 */
uno.CanvasRender.prototype._setState = function(transform, alpha, blend, scale, force) {
    var context = this._context;

    if (transform && (force || !this._contextTransform.equal(transform))) {
        if (this._hasResetTransform && transform.identity())
            context.resetTransform();
        else
            context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
        this._contextTransform.set(transform);
    }

    if (alpha !== undefined && (force || this._contextAlpha !== alpha)) {
        context.globalAlpha = alpha;
        this._contextAlpha = alpha;
    }

    if (blend !== undefined && (force || this._contextBlend !== blend)) {
        context.globalCompositeOperation = uno.CanvasRender._blendModes[blend];
        this._contextBlend = blend;
    }

    if (scale !== undefined && (force || this._contextScale !== scale)) {
        context[uno.CanvasRender._smoothProperty] = scale === uno.Render.SCALE_LINEAR;
        this._contextScale = scale;
    }
};

/**
 * Save current state temporary and change current values
 * @param {uno.Matrix} [transform] - Transformation
 * @param {Number} [alpha] - Transparency
 * @param {Number} [blend] - Rendering blend mode
 * @param {Number} [scale] - Texture scale mode
 * @private
 */
uno.CanvasRender.prototype._tempState = function(transform, alpha, blend, scale) {
    this._tempTransform.set(this._currentTransform);
    this._tempAlpha = this._currentAlpha;
    this._tempBlend = this._currentBlend;
    this._tempScale = this._currentScale;
    this._currentTransform.set(transform);
    this._currentAlpha = alpha;
    this._currentBlend = blend;
    this._currentScale = scale;
    this._setState(transform, alpha, blend, scale);
};

/**
 * Restore saved state
 * @private
 */
uno.CanvasRender.prototype._restoreState = function() {
    this._setState(this._tempTransform, this._tempAlpha, this._tempBlend, this._tempScale);
};

/**
 * Change current working canvas
 * @param {uno.Texture} target - Working texture or null for default canvas
 * @private
 */
uno.CanvasRender.prototype._changeTarget = function(target) {
    if (!target) {
        this._canvas = this._displayCanvas;
        this._context = this._displayContext;
    } else {
        var tex = uno.CanvasTexture.get(target);
        this._canvas = tex.handle();
        this._context = tex.context();
    }
    // We don't know state of the new surface, force update it to current
    this._setState(this._currentTransform, this._currentAlpha, this._currentBlend, this._currentScale, true);
    this._graphics._setState(this.fillColor, this.lineColor, this.lineWidth, true);
};

/**
 * Apply mask to rendered content
 * @private
 */
uno.CanvasRender.prototype._applyMask = function() {
    if (!this._mask || !this._maskBuffer)
        return;
    this._tempState(this._maskTransform, this._maskAlpha);
    this._context.globalCompositeOperation = 'destination-in';
    this.drawTexture(this._mask);
    this._restoreState();
    this._changeTarget(this._target);
    this._tempState(uno.Matrix.IDENTITY, 1, uno.Render.BLEND_NORMAL);
    this.drawTexture(this._maskBuffer);
    this._restoreState();
    this._changeTarget(this._maskBuffer);
    this.clear(uno.Color.TRANSPARENT);
    this._changeTarget(this._target);
    this._mask = null;
};

/**
 * Check for support new blend modes in Canvas context
 * @returns {Boolean}
 * @private
 */
uno.CanvasRender._blendModesSupported = function() {
    if (uno.CanvasRender._blendModesSupport !== undefined)
        return uno.CanvasRender._blendModesSupport;

    var pngHead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
    var pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';

    var magenta = new Image();
    magenta.src = pngHead + 'AP804Oa6' + pngEnd;

    var yellow = new Image();
    yellow.src = pngHead + '/wCKxvRF' + pngEnd;

    var canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;
    var context = canvas.getContext('2d');
    context.globalCompositeOperation = 'multiply';
    context.drawImage(magenta, 0, 0);
    context.drawImage(yellow, 2, 0);

    var data = context.getImageData(2, 0, 1, 1).data;
    uno.CanvasRender._blendModesSupport = (data[0] === 255 && data[1] === 0 && data[2] === 0);

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