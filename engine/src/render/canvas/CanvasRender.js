/**
 * Canvas render
 * @param {Object} settings - See {@link uno.Render.DEFAULT}
 * @constructor
 * @ignore
 */
uno.CanvasRender = function(settings) {
    /**
     * ID of the render
     * @type {Number}
     */
    this.id = 0;

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

    /**
     * Backhground clear color (false if auto clear disabled)
     * @type {Boolean|uno.Color}
     * @default uno.Render.DEFAULT.background
     */
    this.background = null;

    /**
     * Required frame per second
     * @default uno.Render.DEFAULT.ups
     */
    this.fps = 0;

    /**
     * Required updates per second
     * @type {Number}
     * @default uno.Render.DEFAULT.ups
     */
    this.ups = 0;

    /**
     * Width of the render
     * @type {Number}
     * @private
     */
    this._width = 0;

    /**
     * Height of the render
     * @type {Number}
     * @private
     */
    this._height = 0;

    /**
     * Current canvas
     * @type {HTMLCanvasElement}
     * @private
     */
    this._canvas = null;

    /**
     * Display canvas (element on the page)
     * @type {HTMLCanvasElement}
     * @private
     */
    this._displayCanvas = null;

    /**
     * Current canvas context
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._context = null;

    /**
     * Display canvas context (context of the canvas on the page)
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._displayContext = null;

    /**
     * Render state helper
     * @type {uno.CanvasState}
     * @private
     */
    this._state = null;

    /**
     * Graphics helper
     * @type {uno.CanvasGraphics}
     * @private
     */
    this._graphics = null;

    /**
     * Current render target
     * @type {uno.Texture}
     * @private
     */
    this._target = null;

    /**
     * Clipping rectangle
     * @type {uno.Rect}
     * @private
     * @default Full screen
     */
    this._clip = new uno.Rect();

    /**
     * Alpha mask helper
     * @type {uno.CanvasMask}
     * @private
     * @default null
     */
    this._mask = null;

    /**
     * Display canvas bounds on the page
     * @type {uno.Rect}
     * @private
     */
    this._bounds = new uno.Rect();

    /**
     * Cached scroll of the page (for bounds refreshing)
     * @type {uno.Point}
     * @private
     */
    this._boundsScroll = new uno.Point();

    /**
     * Last frame update time
     * @type {Number}
     * @private
     */
    this._lastUpdateTime = 0;

    /**
     * Last frame render time
     * @type {Number}
     * @private
     */
    this._lastRenderTime = 0;

    /**
     * Cached bind of _onFrame function
     * @type {Function}
     * @private
     */
    this._frameBind = null;

    // Initialize

    this._setupSettings(settings);

    if (!this._createContext())
        return;

    this._setupHelpers();
    this._setupViewport(settings);
    this._resetState();
    this._addRender();
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
        if (this._target !== value) {
            this.clip();
            this.mask();
            this._target = value;
            this._setTarget(value);
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
        return this._state.transform;
    },
    set: function(value) {
        if (value)
            this._state.transform.set(value);
        else
            this._state.transform.reset();
    }
});

/**
 * Set current alpha
 * @name uno.CanvasRender#alpha
 * @type {Number}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'alpha', {
    get: function() {
        return this._state.alpha;
    },
    set: function(value) {
        this._state.alpha = value < 0 ? 0 : (value > 1 ? 1 : value);
    }
});

/**
 * Set current blend mode
 * @name uno.CanvasRender#blend
 * @type {Number}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'blend', {
    get: function() {
        return this._state.blend;
    },
    set: function(value) {
        if (this._state.blend === value || !uno.CanvasState.BLEND_MODES[value])
            return;
        this._state.blend = value;
    }
});

/**
 * Current fill color
 * @name uno.CanvasRender#fill
 * @type {uno.Color}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'fill', {
    get: function() {
        return this._state.fill;
    },
    set: function(value) {
        this._state.fill.set(value ? value : uno.Color.TRANSPARENT);
    }
});

/**
 * Current stroke color
 * @name uno.CanvasRender#stroke
 * @type {uno.Color}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'stroke', {
    get: function() {
        return this._state.stroke;
    },
    set: function(value) {
        this._state.stroke.set(value ? value : uno.Color.TRANSPARENT);
    }
});

/**
 * Current stroke thickness
 * @name uno.CanvasRender#thickness
 * @type {Number}
 */
Object.defineProperty(uno.CanvasRender.prototype, 'thickness', {
    get: function() {
        return this._state.thickness;
    },
    set: function(value) {
        this._state.thickness = !value || value < 0 ? 0 : value;
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

    this._mask.resize(width, height);

    // Update render page bounds
    this._updateBounds();

    // Canvas context is reset we should set states
    this._resetState(true);

    // Canvas is cleared we should repeat render frame
    if (this.root)
        this.root.render(this, this._lastRenderTime);

    return this;
};

/**
 * Free all allocated resources and destroy render
 */
uno.CanvasRender.prototype.destroy = function() {
    this._removeRender();

    // Free managers
    this._state = null;
    this._graphics.destroy();
    this._graphics = null;
    this._mask.destroy();
    this._mask = null;

    this._context = null;
    this._canvas = null;
    this._target = null;
    this._displayCanvas = null;
    this._displayContext = null;
    this._bounds = null;
    this._boundsScroll = null;
    this._frameBind = null;

    this.root = null;
};

/**
 * Clear viewport with color
 * @param {uno.Color} [color] - Color to fill viewport. If undefined {@link uno.WebglRender.clearColor} used
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.clear = function(color) {
    var state = this._state;

    if (this._mask.exist()) {
        this._mask.clear(color);
        return this;
    }

    if (!color)
        color = this.background;

    if (color && !color.a) {
        state.save();
        state.reset();
        this._context.clearRect(0, 0, this._width, this._height);
        state.restore();

        return this;
    }

    if (!color)
        return this;

    state.save();
    state.transform.reset();
    state.thickness = 0;
    state.fill.set(color);
    state.sync();

    this._context.fillRect(0, 0, this._width, this._height);

    state.restore();

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
    var clip = this._clip;
    var state = this._state;
    var ctx = this._context;

    if (this._mask.exist()) {
        this._mask.clip(x, y, width, height);
        return this;
    }

    if (x === undefined || x === false) {
        if (clip.equal(0, 0, this._width, this._height))
            return this;

        clip.set(0, 0, this._width, this._height);
        ctx.restore();
        state.sync(true);

        return this;
    }

    if (clip.equal(x, y, width, height))
        return this;

    if (!clip.equal(0, 0, this._width, this._height)) {
        ctx.restore();
        state.sync(true);
    }

    clip.set(x, y, width, height);

    state.save();
    state.transform.reset();
    state.sync();

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    state.restore();

    return this;
};

/**
 * Set or reset mask texture
 * @param {uno.Texture} [texture] - Alpha mask texture (if empty reset mask)
 * @param {uno.Rect} [frame] - The frame to mask rect of the texture (if empty full texture)
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.mask = function(texture, frame) {
    if (texture && texture.ready && !texture.pot && frame && (frame.width > texture.width || frame.height > texture.height)) {
        uno.error('Repeating non power of two mask textures are not supported');
        return this;
    }

    this._mask.set(texture, this.transform, frame);

    return this;
};

/**
 * Set graphics style
 * @param {uno.Color} fill - Fill color
 * @param {uno.Color} stroke - Stroke color
 * @param {Number} thickness - Line width
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.style = function(fill, stroke, thickness) {
    var state = this._state;
    if (fill !== null && fill !== undefined && fill !== false)
        state.fill.set(fill);
    if (stroke !== null && stroke !== undefined && stroke !== false)
        state.stroke.set(stroke);
    if (thickness !== null && thickness !== undefined && thickness !== false)
        state.thickness = thickness;
    return this;
};

/**
 * Draw texture
 * @param {uno.Texture} texture - The texture to render
 * @param {uno.Rect} [frame] - The frame to render rect of the texture (default full texture)
 * @param {uno.Color} [tint=uno.Color.WHITE] - The texture tint color
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.texture = function(texture, frame, tint) {
    var state = this._state;

    if (!texture || !texture.ready || !state.alpha)
        return this;

    state.sync();

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
uno.CanvasRender.prototype.line = function(x1, y1, x2, y2) {
    this._state.sync();
    this._graphics.line(x1, y1, x2, y2);
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
uno.CanvasRender.prototype.rect = function(x, y, width, height) {
    this._state.sync();
    this._graphics.rect(x, y, width, height);
    return this;
};

/**
 * Draw circle
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.circle = function(x, y, radius) {
    this._state.sync();
    this._graphics.circle(x, y, radius);
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
uno.CanvasRender.prototype.ellipse = function(x, y, width, height) {
    this._state.sync();
    this._graphics.ellipse(x, y, width, height);
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
uno.CanvasRender.prototype.arc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    this._state.sync();
    this._graphics.arc(x, y, radius, startAngle, endAngle, antiClockwise);
    return this;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.poly = function(points) {
    this._state.sync();
    this._graphics.poly(points);
    return this;
};

/**
 * Draw previously created shape
 * @param {uno.Shape} shape - The shape created before
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.shape = function(shape) {
    this._state.sync();
    this._graphics.shape(shape);
    return this;
};

/**
 * Start creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.CanvasRender.prototype.beginShape = function() {
    return this._graphics.beginShape();
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
        throw new Error('Can not create render, settings.canvas is not defined');

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

    if (!settings.menu)
        this._canvas.oncontextmenu = function() { return false; };
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
        alpha: this.background === false || !this.background.a
    };

    this._displayContext = this._context = this._canvas.getContext ? this._canvas.getContext('2d', options) : null;

    if (!this._context)
        throw new Error('This browser does not support canvas. Try using another browser');

    return true;
};

/**
 * Initialize viewport size
 * @param {Object} settings - See {@link uno.Render.DEFAULT}
 * @private
 */
uno.CanvasRender.prototype._setupViewport = function(settings) {
    var width = settings.width || uno.Screen.width;
    var height = settings.height || uno.Screen.height;
    this.resize(width, height);
};

/**
 * Initialize helpers
 * @private
 */
uno.CanvasRender.prototype._setupHelpers = function() {
    this._state = new uno.CanvasState(this);
    this._graphics = new uno.CanvasGraphics(this);
    this._mask = new uno.CanvasMask(this);
};

/**
 * Add render to global list of renders
 * @private
 */
uno.CanvasRender.prototype._addRender = function() {
    this.id = uno.Render._uid++;
    uno.Render.renders.push(this);
};

/**
 * Remove render from global list of renders
 * @private
 */
uno.CanvasRender.prototype._removeRender = function() {
    var index = uno.Render.renders.indexOf(this);
    if (index === -1)
        return;
    uno.Render.renders.splice(index, 1);
};

/**
 * Initialize frame callback
 * @private
 */
uno.CanvasRender.prototype._setupFrame = function() {
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
        this.mask();
        this._lastRenderTime = time;
    }
};

/**
 * Reset render state before each frame
 * @private
 */
uno.CanvasRender.prototype._resetState = function(force) {
    this.target = null;
    this._state.reset(force);
    this.clip();
    if (this.background)
        this.clear();
};

/**
 * Change current working canvas
 * @param {uno.Texture} target - Working texture or null for default canvas
 * @private
 */
uno.CanvasRender.prototype._setTarget = function(target) {
    if (!target) {
        this._canvas = this._displayCanvas;
        this._context = this._displayContext;
    } else {
        var tex = uno.CanvasTexture.get(target);
        this._canvas = tex.handle();
        this._context = tex.context();
    }
    this._state.context = this._context;
};