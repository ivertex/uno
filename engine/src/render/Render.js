/**
 * Render creation module
 * @param {Object} settings - Settings for the new render<br>
 *     See uno.Render.DEFAULT<br>
 * @constructor
 */
/*jshint unused: false */
uno.Render = function(settings) {
    settings = settings || {};
    var setts = {};
    var mode = settings.mode || false;

    if (uno.Browser.any) {
        var def = uno.Render.DEFAULT;

        setts.antialias = settings.antialias === undefined ? def.antialias : settings.antialias;
        setts.background = settings.background === undefined ? def.background : settings.background;
        setts.width = settings.width || (def.width || uno.Screen.width);
        setts.height = settings.height || (def.height || uno.Screen.height);
        setts.fps = settings.fps === 0 ? 0 : (settings.fps || def.fps);
        setts.ups = settings.ups === 0 ? 0 : (settings.ups || def.ups);
        setts.menu = settings.menu === undefined ? def.menu : settings.menu;

        if (!settings.canvas) {
            var canvas = document.createElement('canvas');

            if (settings.container instanceof Object) {
                settings.container.appendChild(canvas);
            } else if (settings.container instanceof String) {
                document.getElementById(settings.container).appendChild(canvas);
            } else {
                document.body.appendChild(canvas);
            }

            setts.canvas = canvas;
        } else {
            setts.canvas = settings.canvas;
        }

        if (!mode) {
            this._render = uno.Capabilities.webgl ? new uno.WebglRender(setts) : new uno.CanvasRender(setts);
        } else {
            this._render = mode === uno.Render.RENDER_WEBGL ? new uno.WebglRender(setts) : new uno.CanvasRender(setts);
        }
    } else
        throw new Error('Only browsers currently supported');
};

/**
 * ID of the render
 * @name uno.Render#id
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.Render.prototype, 'id', {
    get: function () {
        return this._render.id;
    }
});

/**
 * Type the render. See {@link uno.Render} constants
 * @name uno.Render#type
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.Render.prototype, 'type', {
    get: function () {
        return this._render.type;
    }
});

/**
 * Root scene object
 * @name uno.Render#root
 * @type {Object}
 */
Object.defineProperty(uno.Render.prototype, 'root', {
    get: function () {
        return this._render.root;
    },
    set: function(value) {
        this._render.root = value;
    }
});

/**
 * Background clear color (false if auto clear disabled)
 * @name uno.Render#background
 * @type {Boolean|uno.Color}
 * @default uno.Render.DEFAULT.background
 */
Object.defineProperty(uno.Render.prototype, 'background', {
    get: function () {
        return this._render.background;
    },
    set: function(value) {
        this._render.background = value;
    }
});

/**
 * Required frame per second
 * @name uno.Render#fps
 * @type {Number}
 * @default uno.Render.DEFAULT.fps
 */
Object.defineProperty(uno.Render.prototype, 'fps', {
    get: function () {
        return this._render.fps;
    },
    set: function(value) {
        this._render.fps = value;
    }
});

/**
 * Required updates per second
 * @name uno.Render#ups
 * @type {Number}
 * @default uno.Render.DEFAULT.ups
 */
Object.defineProperty(uno.Render.prototype, 'ups', {
    get: function () {
        return this._render.ups;
    },
    set: function(value) {
        this._render.ups = value;
    }
});

/**
 * Width of the render
 * @name uno.Render#width
 * @type {Number}
 */
Object.defineProperty(uno.Render.prototype, 'width', {
    get: function () {
        return this._render.width;
    },
    set: function(value) {
        this._render.width = value;
    }
});

/**
 * Height of the render
 * @name uno.Render#height
 * @type {Number}
 */
Object.defineProperty(uno.Render.prototype, 'height', {
    get: function () {
        return this._render.height;
    },
    set: function(value) {
        this._render.height = value;
    }
});

/**
 * Get bounds of render<br>
 * For browser bounds is position and size on page<br>
 * For other platforms position and size on screen
 * @name uno.Render#bounds
 * @type {uno.Rect}
 * @readonly
 */
Object.defineProperty(uno.Render.prototype, 'bounds', {
    get: function() {
        return this._render.bounds;
    }
});

/**
 * Set or reset render target texture
 * @name uno.Render#target
 * @type {uno.Texture}
 */
Object.defineProperty(uno.Render.prototype, 'target', {
    get: function() {
        return this._render.target;
    },
    set: function(value) {
        this._render.target = value;
    }
});

/**
 * Set current transform
 * @name uno.Render#transform
 * @type {uno.Matrix}
 */
Object.defineProperty(uno.Render.prototype, 'transform', {
    get: function() {
        return this._render.transform;
    },
    set: function(value) {
        this._render.transform = value;
    }
});

/**
 * Set current alpha
 * @name uno.Render#alpha
 * @type {Number}
 */
Object.defineProperty(uno.Render.prototype, 'alpha', {
    get: function() {
        return this._render.alpha;
    },
    set: function(value) {
        this._render.alpha = value;
    }
});

/**
 * Set current blend mode
 * @name uno.Render#blend
 * @type {Number}
 */
Object.defineProperty(uno.Render.prototype, 'blend', {
    get: function() {
        return this._render.blend;
    },
    set: function(value) {
        this._render.blend = value;
    }
});

/**
 * Current fill color
 * @name uno.Render#fill
 * @type {uno.Color}
 */
Object.defineProperty(uno.Render.prototype, 'fill', {
    get: function() {
        return this._render.fill;
    },
    set: function(value) {
        this._render.fill = value;
    }
});

/**
 * Current stroke color
 * @name uno.Render#stroke
 * @type {uno.Color}
 */
Object.defineProperty(uno.Render.prototype, 'stroke', {
    get: function() {
        return this._render.stroke;
    },
    set: function(value) {
        this._render.stroke = value;
    }
});

/**
 * Current stroke thickness
 * @name uno.Render#thickness
 * @type {Number}
 */
Object.defineProperty(uno.Render.prototype, 'thickness', {
    get: function() {
        return this._render.thickness;
    },
    set: function(value) {
        this._render.thickness = value;
    }
});

/**
 * Resize viewport
 * @param {Number} width - New width of the viewport
 * @param {Number} height - New width of the viewport
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.resize = function(width, height) {
    this._render.resize(width, height);
    return this;
};

/**
 * Free all allocated resources and destroy render
 */
uno.Render.prototype.destroy = function() {
    this._render.destroy();
};

/**
 * Clear viewport with color
 * @param {uno.Color} [color] - Color to fill viewport. If undefined {@link uno.Render.background} used
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.clear = function(color) {
    this._render.clear(color);
    return this;
};

/**
 * Clip viewport rect
 * @param {Number} x - The x-coordinate of the left-top point of the clip rect
 * @param {Number} y - The y-coordinate of the left-top point of the clip rect
 * @param {Number} width - The clip rectangle width
 * @param {Number} height - The clip rectangle height
 * @returns {uno.Render}
 */
uno.Render.prototype.clip = function(x, y, width, height) {
    this._render.clip(x, y, width, height);
    return this;
};

/**
 * Set or reset mask texture
 * @param {uno.Texture} [texture] - Alpha mask texture (if empty reset mask)
 * @param {uno.Rect} [frame] - The frame to mask rect of the texture (if empty full texture)
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.mask = function(texture, frame) {
    this._render.mask(texture, frame);
    return this;
};

/**
 * Set graphics style
 * @param {uno.Color} fill - Fill color
 * @param {uno.Color} stroke - Stroke color
 * @param {Number} thickness - Line width
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.style = function(fill, stroke, thickness) {
    this._render.style(fill, stroke, thickness);
    return this;
};

/**
 * Draw texture
 * @param {uno.Texture} texture - The texture to render
 * @param {uno.Rect} [frame] - The frame to render rect of the texture (default full texture)
 * @param {uno.Color} [tint=uno.Color.WHITE] - The texture tint color
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.texture = function(texture, frame, tint) {
    this._render.texture(texture, frame, tint);
    return this;
};

/**
 * Draw line
 * @param {Number} x1 - The x-coordinate of the first point of the line
 * @param {Number} y1 - The y-coordinate of the first point of the line
 * @param {Number} x2 - The x-coordinate of the second point of the line
 * @param {Number} y2 - The y-coordinate of the second point of the line
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.line = function(x1, y1, x2, y2) {
    this._render.line(x1, y1, x2, y2);
    return this;
};

/**
 * Draw rectangle
 * @param {Number} x - The x-coordinate of the left-top point of the rect
 * @param {Number} y - The y-coordinate of the left-top point of the rect
 * @param {Number} width - The rectangle width
 * @param {Number} height - The rectangle height
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.rect = function(x, y, width, height) {
    this._render.rect(x, y, width, height);
    return this;
};

/**
 * Draw circle
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.circle = function(x, y, radius) {
    this._render.circle(x, y, radius);
    return this;
};

/**
 * Draw ellipse
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.ellipse = function(x, y, width, height) {
    this._render.ellipse(x, y, width, height);
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
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.arc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    this._render.arc(x, y, radius, startAngle, endAngle, antiClockwise);
    return this;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.poly = function(points) {
    this._render.poly(points);
    return this;
};

/**
 * Draw previously created shape
 * @param {uno.Shape} shape - The shape created before
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.shape = function(shape) {
    this._render.shape(shape);
    return this;
};

/**
 * Start creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.Render.prototype.beginShape = function() {
    return this._render.beginShape();
};

/**
 * Finish creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.Render.prototype.endShape = function() {
    return this._render.endShape();
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
uno.Render.prototype.getPixels = function(texture, x, y, width, height) {
    return this._render.getPixels(texture, x, y, width, height);
};

/**
 * Set texture pixels
 * @param {uno.Texture} texture - The texture to process
 * @param {Uint8ClampedArray} data - Pixels data
 * @param {Number} [x=0] - The x-coordinate of the extracted rect
 * @param {Number} [y=0] - The y-coordinate of the extracted rect
 * @param {Number} [width=Texture width] - The width of the extracted rect
 * @param {Number} [height=Texture height] - The height of the extracted rect
 * @returns {uno.Render} - <code>this</code>
 */
uno.Render.prototype.setPixels = function(texture, data, x, y, width, height) {
    this._render.setPixels(texture, data, x, y, width, height);
    return this;
};

/**
 * Canvas mode rendering
 * @const {Number}
 */
uno.Render.RENDER_CANVAS = 1;

/**
 * WebGL mode rendering
 * @const {Number}
 */
uno.Render.RENDER_WEBGL = 2;

/**
 * Pixelating texture scaling mode
 * @const {Number}
 */
uno.Render.SCALE_NEAREST = 0;

/**
 * Smooth texture scaling mode
 * @const {Number}
 */
uno.Render.SCALE_LINEAR = 1;

/**
 * This is the standard blend mode which uses the top layer alone, without mixing its colors with the layer beneath it
 * @const {Number}
 */
uno.Render.BLEND_NORMAL = 0;

/**
 * This blend mode simply adds pixel values of one layer with the other
 * @const {Number}
 */
uno.Render.BLEND_ADD = 1;

/**
 * This blend mode multiplies the numbers for each pixel of the top layer with the corresponding pixel for the bottom layer
 * TODO: This blend mode is not supported in IE and Edge!
 * @const {Number}
 */
uno.Render.BLEND_MULTIPLY = 2;

/**
 * This blend mode inverts both layers, multiplies them, and then inverts that result
 * TODO: This blend mode is not supported in IE and Edge!
 * @const {Number}
 */
uno.Render.BLEND_SCREEN = 3;

/**
 * Default settings for render
 * @const {Object}
 * @property {uno.Color} background - Color for clearing viewport
 * @property {Number} width - Width of render viewport (0 - fullscreen)
 * @property {Number} height - Height of render viewport (0 - fullscreen)
 * @property {Number} fps - Maximum frame per second (0 - stop rendering)
 * @property {Number} ups - Maximum updates per second (0 - stop updating)
 * @property {uno.Color} fill - Default fill color
 * @property {uno.Color} stroke - Default line color
 * @property {Number} thickness - Default line width
 * @property {HTMLCanvasElement} canvas - For browser mode canvas element for render
 * @property {Object|String} container - For browser mode ID or HTML element to add new canvas to it if settings.canvas is null
 * @property {Boolean} menu - For browser mode disable or enable right click context menu
 */
uno.Render.DEFAULT = {
    background: uno.Color.WHITE.clone(),
    width: 0,
    height: 0,
    fps: 60,
    ups: 60,
    fill: uno.Color.WHITE.clone(),
    stroke: uno.Color.BLACK.clone(),
    thickness: 1,
    canvas: null,
    container: null,
    menu: false
};

/**
 * List of all created renders
 * @type {Array}
 */
uno.Render.renders = [];

/**
 * Counter for render unique id
 * @type {Number}
 * @private
 */
uno.Render._uid = 0;