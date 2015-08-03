/**
 * WebGL render
 * @param {Object} settings - See {@link uno.Render.DEFAULT}
 * @constructor
 */
uno.WebglRender = function(settings) {
    /**
     * Root scene object
     * @type {uno.Object}
     */
    this.root = null;

    this._setupSettings(settings);
    this._setupProps();
    this._setupRestore();
    this._createContext();
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
 * @default uno.Render.RENDER_WEBGL
 * @readonly
 */
Object.defineProperty(uno.WebglRender.prototype, 'type', {
    get: function () {
        return uno.Render.RENDER_WEBGL;
    }
});

/**
 * Width of the render
 * @name uno.WebglRender#width
 * @type {Number}
 */
Object.defineProperty(uno.WebglRender.prototype, 'width', {
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
 * @name uno.WebglRender#height
 * @type {Number}
 */
Object.defineProperty(uno.WebglRender.prototype, 'height', {
    get: function () {
        return this._height;
    },
    set: function(value) {
        if (value !== this._height)
            this.resize(this._width, value);
    }
});

/**
 * Bounds of the render<br>
 * For browser bounds is position and size on page<br>
 * For other platforms position and size on screen
 * @name uno.WebglRender#bounds
 * @type {uno.Rect}
 * @readonly
 */
Object.defineProperty(uno.WebglRender.prototype, 'bounds', {
    get: function () {
        if (!this._boundsScroll.equal(uno.Screen.scrollX, uno.Screen.scrollY))
            this._updateBounds();
        return this._bounds;
    }
});

/**
 * Render target texture
 * @name uno.WebglRender#target
 * @type {uno.Texture}
 */
Object.defineProperty(uno.WebglRender.prototype, 'target', {
    get: function() {
        return this._target;
    },
    set: function(value) {
        if (!value) {
            if (value !== this._target) {
                this._graphics.flush();
                this._batch.flush();
                this._target = null;
                this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);
                this._projection.x = this.width * 0.5;
                this._projection.y = -this.height * 0.5;
                this._context.viewport(0, 0, this.width, this.height);
                this._updateShaders();
            }
        } else {
            if (this._target !== value) {
                this._graphics.flush();
                this._batch.flush();
                this._target = value;
                this._context.bindFramebuffer(this._context.FRAMEBUFFER, uno.WebglTexture.get(value).handle(this, true));
                this._projection.x = value.width * 0.5;
                this._projection.y = -value.height * 0.5;
                this._context.viewport(0, 0, value.width, value.height);
                this._updateShaders();
            }
        }
    }
});

/**
 * Current transform
 * @name uno.WebglRender#transform
 * @type {uno.Matrix}
 */
Object.defineProperty(uno.WebglRender.prototype, 'transform', {
    get: function() {
        return this._currentTransform;
    },
    set: function(value) {
        this._currentTransform.set(value);
    }
});

/**
 * Current alpha
 * @name uno.WebglRender#alpha
 * @type {Number}
 */
Object.defineProperty(uno.WebglRender.prototype, 'alpha', {
    get: function() {
        return this._currentAlpha;
    },
    set: function(value) {
        this._currentAlpha = value;
    }
});

/**
 * Current blend mode
 * @name uno.WebglRender#blend
 * @type {Number}
 * @default uno.Render.RENDER_NORMAL
 */
Object.defineProperty(uno.WebglRender.prototype, 'blend', {
    get: function() {
        return this._currentBlendMode;
    },
    set: function(value) {
        if (this._currentBlendMode === value || !uno.WebglRender._blendModes[value])
            return;
        this._currentBlendMode = value;
    }
});

/**
 * Current fill color
 * @name uno.WebglRender#fillColor
 * @type {uno.Color}
 */
Object.defineProperty(uno.WebglRender.prototype, 'fillColor', {
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
 * @name uno.WebglRender#lineColor
 * @type {uno.Color}
 */
Object.defineProperty(uno.WebglRender.prototype, 'lineColor', {
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
 * @name uno.WebglRender#lineWidth
 * @type {Number}
 */
Object.defineProperty(uno.WebglRender.prototype, 'lineWidth', {
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
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.resize = function(width, height) {
    this._width = width;
    this._height = height;
    this._canvas.width = width;
    this._canvas.height = height;
    this._projection.x = width / 2;
    this._projection.y = -height / 2;
    this._context.viewport(0, 0, width, height);
    this._clip.set(0, 0, width, height);

    this._updateBounds();
    this._updateShaders();

    return this;
};

/**
 * Free all allocated resources and destroy render
 */
uno.WebglRender.prototype.destroy = function() {
    if (!uno.Render.renders[this.id])
        return;
    delete uno.Render.renders[this.id];

    // Free managers
    this._batch.destroy();
    this._batch = null;
    this._graphics.destroy();
    this._graphics = null;

    // Free all owned shaders
    for (var i in this._shaders)
        this._shaders[i].destroy();
    this._currentShader = null;
    this._currentTransform = null;
    this._shaders = null;

    // Free all owned texture handles
    var restores = this._restoreObjects, l = restores.length;
    for (i = 0; i < l; ++i)
        if (restores[i] instanceof uno.WebglTexture)
            restores[i].destroyHandle(this);
    this._restoreObjects = null;

    this._canvas.removeEventListener('webglcontextlost', this._contextLostHandle);
    this._canvas.removeEventListener('webglcontextrestored', this._contextRestoredHandle);
    this._contextLostHandle = null;
    this._contextRestoredHandle = null;

    this._context = null;
    this._target = null;
    this._canvas = null;
    this._projection = null;
    this._bounds = null;
    this._boundsScroll = null;
    this._frameBind = null;

    this.root = null;
};

/**
 * Clear viewport with color
 * @param {uno.Color} [color] - Color to fill viewport. If undefined {@link uno.WebglRender.background} used
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.clear = function(color) {
    this._graphics.reset();
    this._batch.reset();

    var ctx = this._context;

    if (!color)
        color = this.background;

    if (!color) {
        ctx.colorMask(false, false, false, false);
        ctx.clear(ctx.COLOR_BUFFER_BIT);
        ctx.colorMask(true, true, true, true);
        return this;
    }

    ctx.clearColor(color.r, color.g, color.b, color.a);
    ctx.clear(ctx.COLOR_BUFFER_BIT);

    return this;
};

/**
 * Clip viewport rect
 * @param {Number} x - The x-coordinate of the left-top point of the clip rect
 * @param {Number} y - The y-coordinate of the left-top point of the clip rect
 * @param {Number} width - The clip rectangle width
 * @param {Number} height - The clip rectangle height
 * @returns {uno.WebglRender}
 */
uno.WebglRender.prototype.clip = function(x, y, width, height) {
    var ctx = this._context;
    var clip = this._clip;
    var full = clip.x === 0 && clip.y === 0 && clip.width === this._width && clip.height === this._height;

    if (clip.x === x && clip.y === y && clip.width === width && clip.height === height) {
        return this;
    }

    if (x === undefined || x === false) {
        if (!full) {
            this._graphics.flush();
            this._batch.flush();
        }
        clip.set(0, 0, this._width, this._height);
        ctx.disable(ctx.SCISSOR_TEST);
        return this;
    }

    if (!full) {
        this._graphics.flush();
        this._batch.flush();
    }

    clip.set(x, y, width, height);
    ctx.enable(ctx.SCISSOR_TEST);
    ctx.scissor(x, this._height - y - height, width, height);

    return this;
};

/**
 * Draw texture
 * @param {uno.Texture} texture - The texture to render
 * @param {uno.Rect} [frame] - The frame to render rect of the texture (default full texture)
 * @param {uno.Color} [tint=uno.Color.WHITE] - The texture tint color
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawTexture = function(texture, frame, tint) {
    if (!texture ||  !texture.ready || !this._currentAlpha)
        return this;

    if (!texture.pot && frame && (frame.width > texture.width || frame.height > texture.height)) {
        uno.error('Repeating non power of two textures are not supported');
        return this;
    }

    this._graphics.flush();
    this._batch.draw(this._currentTransform, uno.WebglTexture.get(texture),
        frame ? frame.x : 0, frame ? frame.y : 0,
        frame ? frame.width / texture.width : 1, frame ? frame.height / texture.height : 1,
        this._currentAlpha, this._currentBlendMode, tint || uno.Color.WHITE);

    return this;
};

/**
 * Draw line
 * @param {Number} x1 - The x-coordinate of the first point of the line
 * @param {Number} y1 - The y-coordinate of the first point of the line
 * @param {Number} x2 - The x-coordinate of the second point of the line
 * @param {Number} y2 - The y-coordinate of the second point of the line
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawLine = function(x1, y1, x2, y2) {
    if (!this._currentAlpha)
        return this;
    this._batch.flush();
    this._graphics.drawLine(this._currentTransform, x1, y1, x2, y2, this._currentAlpha, this._currentBlendMode);
    return this;
};

/**
 * Draw rectangle
 * @param {Number} x - The x-coordinate of the left-top point of the rect
 * @param {Number} y - The y-coordinate of the left-top point of the rect
 * @param {Number} width - The rectangle width
 * @param {Number} height - The rectangle height
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawRect = function(x, y, width, height) {
    if (!this._currentAlpha)
        return this;
    this._batch.flush();
    this._graphics.drawRect(this._currentTransform, x, y, width, height, this._currentAlpha, this._currentBlendMode);
    return this;
};

/**
 * Draw circle
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawCircle = function(x, y, radius) {
    if (!this._currentAlpha)
        return this;
    this._batch.flush();
    this._graphics.drawCircle(this._currentTransform, x, y, radius, this._currentAlpha, this._currentBlendMode);
    return this;
};

/**
 * Draw ellipse
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawEllipse = function(x, y, width, height) {
    if (!this._currentAlpha)
        return this;
    this._batch.flush();
    this._graphics.drawEllipse(this._currentTransform, x, y, width, height, this._currentAlpha, this._currentBlendMode);
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
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawArc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    if (!this._currentAlpha)
        return this;
    this._batch.flush();
    this._graphics.drawArc(this._currentTransform, x, y, radius, startAngle, endAngle, antiClockwise,
        this._currentAlpha, this._currentBlendMode);
    return this;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawPoly = function(points) {
    if (!this._currentAlpha)
        return this;
    this._batch.flush();
    this._graphics.drawPoly(this._currentTransform, points, this._currentAlpha, this._currentBlendMode);
    return this;
};

/**
 * Draw previously created shape
 * @param {uno.Shape} shape - The shape created before
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawShape = function(shape) {
    if (!this._currentAlpha)
        return this;
    this._batch.flush();
    this._graphics.drawShape(this._currentTransform, shape, this._currentAlpha);
    return this;
};

/**
 * Start creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.WebglRender.prototype.startShape = function() {
    return this._graphics.startShape();
};

/**
 * Finish creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.WebglRender.prototype.endShape = function() {
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
uno.WebglRender.prototype.getPixels = function(texture, x, y, width, height) {
    var w = texture ? texture.width : this.width;
    var h = texture ? texture.height : this.height;

    x = x || 0;
    y = y || 0;
    width = width || w;
    height = height || h;

    if (x < 0 || y < 0 || x + width > w || y + height > h)
        return null;

    this._graphics.flush();
    this._batch.flush();

    y = h - y - height;

    var source = texture ? uno.WebglTexture.get(texture) : this;

    if (!source._imageData || source._imageData.length !== width * height * 4) {
        source._imageBuffer = new ArrayBuffer(width * height * 4);
        source._imageData = new Uint8Array(source._imageBuffer);
        source._imageDataClamped = new Uint8ClampedArray(source._imageBuffer);
        source._imageData32 = new Uint32Array(source._imageBuffer);
    }

    var ctx = this._context;

    if (texture || this._target)
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, texture ? source.handle(this, true) : null);
    if (texture)
        ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, source.handle(this), 0);
    ctx.readPixels(x, y, width, height, ctx.RGBA, ctx.UNSIGNED_BYTE, source._imageData);

    var target = this._target;
    if (target === null)
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
    else
        this.target = target;

    // Flip by Y
    if (height > 1) {
        var tmp = 0;
        var data = source._imageData32;

        h = height * 0.5;
        for (y = 0; y < h; ++y) {
            for (x = 0; x < width; ++x) {
                tmp = data[y * width + x];
                data[y * width + x] = data[(height - y - 1) * width + x];
                data[(height - y - 1) * width + x] = tmp;
            }
        }
    }

    return source._imageDataClamped;
};

/**
 * Set texture pixels
 * @param {uno.Texture} texture - The texture to process
 * @param {Uint8ClampedArray} data - Pixels data
 * @param {Number} [x=0] - The x-coordinate of the extracted rect
 * @param {Number} [y=0] - The y-coordinate of the extracted rect
 * @param {Number} [width=Texture width] - The width of the extracted rect
 * @param {Number} [height=Texture height] - The height of the extracted rect
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.setPixels = function(texture, data, x, y, width, height) {
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

    y = h - y - height;

    var tex = uno.WebglTexture.get(texture);

    if (data !== tex._imageDataClamped)
        tex._imageDataClamped.set(data);

    var ctx = this._context;
    ctx.bindTexture(ctx.TEXTURE_2D, tex.handle(this));
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
    ctx.texSubImage2D(ctx.TEXTURE_2D, 0, x, y, width, height, ctx.RGBA, ctx.UNSIGNED_BYTE, tex._imageData);
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);

    return this;
};

/**
 * Get shader from registered
 * @param {Object} shader - The shader settings object. If undefined than current shader returned
 * @returns {uno.WebglShader} - Shader
 * @private
 */
uno.WebglRender.prototype._getShader = function(shader) {
    if (!shader)
        return this._currentShader;
    if (this._shaders[shader.name])
        return this._shaders[shader.name];
    var newShader = new uno.WebglShader(this, shader);
    newShader.uProjection.values(this._projection.x, this._projection.y);
    this._shaders[shader.name] = newShader;
    return newShader;
};

/**
 * Set current shader
 * @param {uno.WebglRender} shader - Use the shader for rendering
 * @private
 */
uno.WebglRender.prototype._setShader = function(shader) {
    if (this._currentShader === shader)
        return;
    shader.use();
    this._currentShader = shader;
};

/**
 * Update uniform uProjection for registered shaders after render resize
 * @private
 */
uno.WebglRender.prototype._updateShaders = function() {
    var shaders = this._shaders;
    for (var i in shaders) {
        var shader = shaders[i];
        if (shader.uProjection) {
            shader.use();
            shader.uProjection.values(this._projection.x, this._projection.y);
        }
    }
    if (this._currentShader)
        this._currentShader.use();
};

/**
 * Debug method for losing context
 * @param {Number} restoreAfter - Timeout for context restoring
 * @returns {Boolean} - Is context loosed
 * @private
 */
uno.WebglRender.prototype._loseContext = function(restoreAfter) {
    var ext = this._context.getExtension('WEBGL_lose_context');
    if (!ext) {
        uno.log('Lose context extension not supported');
        return false;
    }
    uno.log('Killing context in render with id [', this.id, ']');
    ext.loseContext();
    setTimeout(function() {
        uno.log('Restoring context in render with id [', this.id, ']');
        ext.restoreContext();
    }.bind(this), restoreAfter || 1000);
    return true;
};

/**
 * Initialize settings properties helper
 * @param {Object} settings - See {@link uno.Render.DEFAULT}
 * @private
 */
uno.WebglRender.prototype._setupSettings = function(settings) {
    var def = uno.Render.DEFAULT;

    if (!settings.canvas)
        return uno.error('Can not create render, settings.canvas is not defined');

    if (settings.background === false)
        this.background = false;
    else
        this.background = settings.background === undefined ? def.background.clone() : settings.background.clone();

    this.fps = settings.fps === 0 ? 0 : (settings.fps || def.fps);
    this.ups = settings.ups === 0 ? 0 : (settings.ups || def.ups);

    this._canvas = settings.canvas;

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
uno.WebglRender.prototype._setupProps = function() {
    this._bounds = new uno.Rect();
    this._boundsScroll = new uno.Point();
    this._projection = new uno.Point();
    this._target = null;
    this._currentTransform = new uno.Matrix();
    this._currentAlpha = 1;
    this._currentBlendMode = uno.BLEND_NORMAL;
    this._contextBlendMode = -1;
    this._currentShader = null;
    this._shaders = {};
    this._clip = new uno.Rect(0, 0, this._width, this._height);
};

/**
 * Initialize context restoring functionality
 * @private
 */
uno.WebglRender.prototype._setupRestore = function() {
    this._contextLost = false;
    this._restoreObjects = [];
    this._contextLostHandle = this._onContextLost.bind(this);
    this._contextRestoredHandle = this._onContextRestored.bind(this);
    this._canvas.addEventListener('webglcontextlost', this._contextLostHandle, false);
    this._canvas.addEventListener('webglcontextrestored', this._contextRestoredHandle, false);
};

/**
 * Add resource for restoring after restore context
 * @param {Object} target - Object should have method <code>_restore</code>
 * @returns {Boolean} - Is added
 * @private
 */
uno.WebglRender.prototype._addRestore = function(target) {
    if (!target._restore)
        return uno.error('Object has no _restore method for context lost handling');
    if (this._restoreObjects.indexOf(target) !== -1)
        return false;
    this._restoreObjects.push(target);
    return true;
};

/**
 * Remove resource from restoring after restore context
 * @param {Object} target - Added for restoring object
 * @returns {Boolean} - Is removed
 * @private
 */
uno.WebglRender.prototype._removeRestore = function(target) {
    var i = this._restoreObjects.indexOf(target);
    if (i !== -1) {
        this._restoreObjects.splice(i, 1);
        return true;
    }
    return false;
};

/**
 * Call <code>_restore</code> method for all registered objects
 * @private
 */
uno.WebglRender.prototype._restore = function() {
    for (var i = 0, l = this._restoreObjects.length; i < l; ++i) {
        this._restoreObjects[i]._restore(this);
    }
    this._updateShaders();
};

/**
 * Context lost callback
 * @param {Event} e
 * @private
 */
uno.WebglRender.prototype._onContextLost = function(e) {
    e.preventDefault();
    this._contextLost = true;
};

/**
 * Context restore callback
 * @private
 */
uno.WebglRender.prototype._onContextRestored = function() {
    this._createContext();
};

/**
 * Update render bounds
 * @private
 */
uno.WebglRender.prototype._updateBounds = function() {
    var rect = this._canvas.getBoundingClientRect();
    this._bounds.set(rect.left, rect.top, rect.width, rect.height);
    this._boundsScroll.set(uno.Screen.scrollX, uno.Screen.scrollY);
};

/**
 * Create WebGL context
 * @private
 */
uno.WebglRender.prototype._createContext = function() {
    var options = {
        depth: false,
        antialias: true,
        stencil: false,
        alpha: this.background === false || !this.background.a,
        premultipliedAlpha: true,
        preserveDrawingBuffer: this.background === false
    };

    var error = 'This browser does not support webGL. Try using the canvas render';
    try {
        this._context = this._canvas.getContext('experimental-webgl', options) ||
            this._canvas.getContext('webgl', options);
    } catch (e) {
        return uno.error(error);
    }
    if (!this._context)
        return uno.error(error);

    var ctx = this._context;
    ctx.disable(ctx.DEPTH_TEST);
    ctx.disable(ctx.CULL_FACE);
    ctx.enable(ctx.BLEND);
    ctx.colorMask(true, true, true, true);

    uno.WebglRender._initBlendModes(ctx);

    this._currentShader = null;
    this._setBlendMode();
    this._restore();
    this._contextLost = false;
};

/**
 * Initialize viewport size
 * @param {Object} settings - See {@link uno.Render.DEFAULT}
 * @private
 */
uno.WebglRender.prototype._setupViewport = function(settings) {
    var width = settings.width || uno.Screen.availWidth;
    var height = settings.height || uno.Screen.availHeight;
    this.resize(width, height);
};

/**
 * Initialize helpers
 * @private
 */
uno.WebglRender.prototype._setupManagers = function() {
    this._batch = new uno.WebglBatch(this);
    this._graphics = new uno.WebglGraphics(this);
};

/**
 * Register render in global list of renders
 * @private
 */
uno.WebglRender.prototype._registerRender = function() {
    this.id = uno.Render._uid++;
    uno.Render.renders.push(this);
};

/**
 * Initialize frame callback
 * @private
 */
uno.WebglRender.prototype._setupFrame = function() {
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
uno.WebglRender.prototype._onFrame = function(time) {
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
        this._graphics.flush();
        this._batch.flush();
        this._lastRenderTime = time;
    }
};

/**
 * Reset render state after frame
 * @private
 */
uno.WebglRender.prototype._resetState = function() {
    this.target = null;
    this.transform.reset();
    this.alpha = 1;
    this.blend = uno.Render.BLEND_NORMAL;

    var defaults = uno.Render.DEFAULT;
    this.fillColor = defaults.fillColor;
    this.lineColor = defaults.lineColor;
    this.lineWidth = defaults.lineWidth;

    this.clear();
};

/**
 * Blend mode apply helper
 * @param {Number} [mode=uno.Render.BLEND_NORMAL] - New blend mode
 * @private
 */
uno.WebglRender.prototype._setBlendMode = function(mode) {
    mode = mode || uno.Render.BLEND_NORMAL;
    if (mode === this._contextBlendMode  || !uno.WebglRender._blendModes[mode])
        return;
    var items = uno.WebglRender._blendModes[mode];
    this._context.blendFunc(items[0], items[1]);
    this._contextBlendMode = mode;
};

/**
 * Initialize WebGL blend modes
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @private
 */
uno.WebglRender._initBlendModes = function(ctx) {
    if (uno.WebglRender._blendModes !== undefined)
        return;
    var result = {};
    result[uno.Render.BLEND_NONE]       = [ctx.ONE, ctx.ZERO];
    result[uno.Render.BLEND_NORMAL]     = [ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA];
    result[uno.Render.BLEND_ADD]        = [ctx.ONE, ctx.ONE];
    result[uno.Render.BLEND_MULTIPLY]   = [ctx.DST_COLOR, ctx.ONE_MINUS_SRC_ALPHA];
    result[uno.Render.BLEND_SCREEN]     = [ctx.ONE, ctx.ONE_MINUS_SRC_COLOR];
    uno.WebglRender._blendModes = result;
};