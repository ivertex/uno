/**
 * WebGL implementation for rendering graphics shapes
 * @param {uno.WebglRender} render - WebGL render instance
 * @constructor
 * @ignore
 */
uno.WebglGraphics = function(render) {
    /**
     * Host render
     * @type {uno.WebglRender}
     * @private
     */
    this._render = render;

    /**
     * Arc, ellipse and circle smoothing (multiplier for sqrt(radius))
     * @type {Number}
     * @private
     */
    this._smooth = 6;

    /**
     * Vertex size in buffer (x, y, abgr pack - alpha and tint color, 4 byte each)
     * @type {Number}
     * @private
     */
    this._vertexSize = 3;

    /**
     * Max batch size in vertices
     * @type {Number}
     * @private
     */
    this._maxVertexCount = 6000;

    /**
     * Current count of vertices in batch
     * @type {Number}
     * @private
     */
    this._vertexCount = 0;

    /**
     * Current count of indices in batch
     * @type {Number}
     * @private
     */
    this._indexCount = 0;

    /**
     * Indeces array
     * @type {Uint16Array}
     * @private
     */
    this._indices = new Uint16Array(this._maxVertexCount * 2);

    /**
     * Array with all vertices data
     * @type {ArrayBuffer}
     * @private
     */
    this._vertices = new ArrayBuffer(this._maxVertexCount * this._vertexSize * 4);

    /**
     * View for vertices array with float32 type (for x, y, u, v values fill)
     * @type {Float32Array}
     * @private
     */
    this._positions = new Float32Array(this._vertices);

    /**
     * View for tint colors array with uint32 type (for ABGR pack - alpha and tint color)
     * @type {Uint32Array}
     * @private
     */
    this._colors = new Int32Array(this._vertices);

    /**
     * Min size in vertices of shape (line, rect)
     * @type {Number}
     * @private
     */
    this._minShapeSize = 4;


    /**
     * Array states of the batch (each item is number of shapes with equal blend mode together)
     * @type {Uint16Array}
     * @private
     */
    this._states = new Uint16Array(this._maxVertexCount / this._minShapeSize);

    /**
     * Count of states in current batch
     * @type {Number}
     * @private
     */
    this._stateCount = 0;

    /**
     * Blend modes for each state of batch
     * @type {Uint8Array}
     * @private
     */
    this._stateBlends = new Uint8Array(this._maxVertexCount / this._minShapeSize);

    /**
     * Last blend mode added to states
     * @type {Number}
     * @private
     */
    this._stateBlendLast = -1;

    /**
     * Current composed shape
     * @type {uno.Shape}
     * @private
     */
    this._shape = null;

    /**
     * Current shape start index at indices
     * @type {Number}
     * @private
     */
    this._shapeIndex = 0;

    /**
     * Current shape start index in vertexes
     * @type {Number}
     * @private
     */
    this._shapeVertex = 0;

    /**
     * Indices array for poly render (prevent gc)
     * @type {Array}
     * @private
     */
    this._polyIndices = [];

    this._restore();
    render._addRestore(this);
};

/**
 * Free all allocated resources and destroy graphics
 */
uno.WebglGraphics.prototype.destroy = function() {
    this._render._removeRestore(this);

    this._free();

    this._indices = null;
    this._vertices = null;
    this._render = null;
    this._states = null;
    this._stateBlends = null;
};

/**
 * Free buffers
 * @private
 */
uno.WebglGraphics.prototype._free = function() {
    var ctx = this._render._context;
    ctx.deleteBuffer(this._vertexBuffer);
    ctx.deleteBuffer(this._indexBuffer);
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglGraphics.prototype._lose = function() {
    this._free();
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglGraphics.prototype._restore = function() {
    var ctx = this._render._context;
    var consts = uno.WebglConsts;

    this._vertexBuffer = ctx.createBuffer();
    this._indexBuffer = ctx.createBuffer();

    ctx.bindBuffer(consts.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(consts.ARRAY_BUFFER, this._vertexBuffer);
    ctx.bufferData(consts.ELEMENT_ARRAY_BUFFER, this._indices, consts.DYNAMIC_DRAW);
    ctx.bufferData(consts.ARRAY_BUFFER, this._vertices, consts.DYNAMIC_DRAW);
};

/**
 * Reset graphics batch
 */
uno.WebglGraphics.prototype.reset = function() {
    this._stateBlendLast = uno.Render.BLEND_NORMAL;
    this._stateCount = 0;
    this._vertexCount = 0;
    this._indexCount = 0;
};

/**
 * Render all current shapes and free batch buffers
 * @returns {Boolean} - Is rendered anything
 */
uno.WebglGraphics.prototype.flush = function() {
    if (!this._vertexCount)
        return false;

    var render = this._render;
    var state = render._state;
    var mask = render._mask;
    var ctx = render._context;
    var consts = uno.WebglConsts;

    ctx.bindBuffer(consts.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(consts.ARRAY_BUFFER, this._vertexBuffer);

    var shader;
    if (mask.enabled()) {
        shader = render._useShader(uno.WebglShader.GRAPHICS_MASK);
        mask.apply(shader, 0);
    } else {
        shader = render._useShader(uno.WebglShader.GRAPHICS);
    }
    shader.uProjection.set(render._projection);

    // TODO: Check perfomance & gc
    // If batch have size more than max half send it all to GPU, otherwise send subarray (minimize send size)
    if (this._vertexCount > this._maxVertexCount * 0.5) {
        ctx.bufferSubData(consts.ELEMENT_ARRAY_BUFFER, 0, this._indices);
        ctx.bufferSubData(consts.ARRAY_BUFFER, 0, this._vertices);
    } else {
        ctx.bufferSubData(consts.ELEMENT_ARRAY_BUFFER, 0, this._indices.subarray(0, this._indexCount));
        ctx.bufferSubData(consts.ARRAY_BUFFER, 0, this._positions.subarray(0, this._vertexCount * this._vertexSize));
    }

    var states = this._states;
    var modes = this._stateBlends;
    var index = 0;
    var count = 0;

    state.save();
    for (var i = 0, l = this._stateCount; i < l; ++i) {
        state.blend = modes[i];
        state.sync();
        count = states[i];
        ctx.drawElements(consts.TRIANGLES, count - index, consts.UNSIGNED_SHORT, index * 2);
        index = count;
    }
    state.restore();

    this.reset();

    return true;
};

/**
 * Start collect new shape
 * @returns {uno.Shape} - Created shape
 */
uno.WebglGraphics.prototype.beginShape = function() {
    this._shape = new uno.Shape();
    this._shapeIndex = this._indexCount;
    this._shapeVertex = this._vertexCount;
    this._shapeState = this._stateCount;
    return this._shape;
};

/**
 * Finish collect new shape
 * @returns {uno.Shape} - Created shape
 */
uno.WebglGraphics.prototype.endShape = function() {
    var shape = this._shape;
    if (!shape)
        return null;

    if (this._vertexCount - this._shapeVertex === 0) {
        this._shape = null;
        this._shapeIndex = 0;
        this._shapeVertex = 0;
        this._shapeState = 0;
        return shape;
    }

    var ic = this._indexCount - this._shapeIndex;
    var vc = this._vertexCount - this._shapeVertex;
    var sc = this._stateCount - this._shapeState;

    shape._indices = new Uint16Array(this._indices.subarray(this._shapeIndex, ic));
    shape._states = new Uint16Array(this._states.subarray(this._shapeState, sc));
    shape._blends = new Uint8Array(this._stateBlends.subarray(this._shapeState, sc));

    shape._vertices = new ArrayBuffer(vc * this._vertexSize * 4);
    shape._colors = new Int32Array(shape._vertices);
    shape._positions = new Float32Array(shape._vertices);

    var source = this._colors;
    var dest = shape._colors;
    var start = this._shapeVertex;
    var i = vc * this._vertexSize;

    while (i--)
        dest[i] = source[i - start];

    this._indexCount -= ic;
    this._vertexCount -= vc;
    this._stateCount -= sc;
    this._shape = null;
    this._shapeIndex = 0;
    this._shapeVertex = 0;
    this._shapeState = 0;

    return shape;
};

/**
 * Draw previous created shape
 * @param {uno.Shape} shape - The shape for rendering
 * @returns {Boolean} - Is shape rendered
 */
uno.WebglGraphics.prototype.shape = function(shape) {
    var state = this._render._state;
    var transform = state.transform;
    var alpha = state.alpha;
    var items = shape.items;

    if (!items || !items.length || !alpha)
        return false;

    var i, j, l, source, dest, item;
    var emptyTransform = uno.Matrix.IDENTITY;
    var types = uno.Shape;

    // If shape not made
    if (!shape._indices || !shape._vertices) {
        this._shapeIndex = this._indexCount;
        this._shapeVertex = this._vertexCount;
        this._shapeState = this._stateCount;

        state.save();

        for (i = 0, l = items.length; i < l; ++i) {
            item = items[i];
            source = item.shape;

            state.transform.set(item.transform ? item.transform : emptyTransform);
            state.alpha = alpha;
            state.thickness = item.thickness;
            state.blend = item.blend;

            if (item.fill)
                state.fill.set(item.fill);

            if (item.stroke)
                state.stroke.set(item.stroke);

            switch (item.type) {
                case types.LINE:
                    this.line(source.x1, source.y1, source.x2, source.y2);
                    break;
                case types.RECT:
                    this.rect(source.x, source.y, source.width, source.height);
                    break;
                case types.CIRCLE:
                    this.circle(source.x, source.y, source.radius);
                    break;
                case types.ELLIPSE:
                    this.ellipse(source.x, source.y, source.width, source.height);
                    break;
                case types.ARC:
                    this.arc(source.x, source.y, source.radius, source.startAngle, source.endAngle, source.antiClockwise);
                    break;
                case types.POLY:
                    this.poly(source.points);
                    break;
            }
        }

        state.restore();

        this._shape = shape;
        this.endShape();
    }

    // Check for max batch size limitation
    if (this._maxVertexCount - this._vertexCount < shape._positions.length * this._vertexSize)
        this.flush();

    // Copy all indices
    dest = this._indices;
    source = shape._indices;
    i = source.length + 1;
    j = this._indexCount + i;
    this._indexCount = j - 1;
    while (i)
        dest[--j] = source[--i];

    // Copy all vertices
    dest = this._positions;
    source = shape._positions;
    var cdest = this._colors;
    var csource = shape._colors;

    i = source.length;
    j = this._vertexCount + i;
    this._vertexCount = j;

    var x, y, color;
    var a = transform.a, b = transform.b, c = transform.c, d = transform.d, tx = transform.tx, ty = transform.ty;
    var identity = transform.identity();

    while (i > 0) {
        // If alpha equal 1 simple copy vertex color else multiply with vertex alpha
        if (alpha === 1) {
            cdest[--j] = csource[--i];
        } else {
            color = csource[--i];
            cdest[--j] = color & 0x00FFFFFF | ((color >> 24 & 0xFF) / 255 * alpha) * 255 << 24;
        }
        // If transform is empty simple copy position else multiply with vertex position
        if (identity) {
            dest[--j] = source[--i];
            dest[--j] = source[--i];
        } else {
            y = source[--i];
            x = source[--i];
            dest[--j] = c * x + d * y + ty;
            dest[--j] = a * x + b * y + tx;
        }
    }

    // Copy states for shape
    dest = this._states;
    source = shape._states;
    i = source.length;
    j = this._stateCount + i;
    while (i)
        dest[--j] = source[--i];

    // Copy state blend modes
    dest = this._stateBlends;
    source = shape._blends;
    i = source.length;
    j = this._stateCount + i;
    while (i)
        dest[--j] = source[--i];

    this._stateCount += source.length;
    if (this._vertexCount >= this._maxVertexCount)
        this.flush();
    return true;
};

/**
 * Draw line
 * @param {Number} x1 - The x-coordinate of the first point of the line
 * @param {Number} y1 - The y-coordinate of the first point of the line
 * @param {Number} x2 - The x-coordinate of the second point of the line
 * @param {Number} y2 - The y-coordinate of the second point of the line
 * @returns {Boolean} - Is line rendered
 */
uno.WebglGraphics.prototype.line = function(x1, y1, x2, y2) {
    var state = this._render._state;
    var transform = state.transform;
    var alpha = state.alpha;
    var thickness = state.thickness;

    if (!thickness || !alpha || !state.stroke.a)
        return false;

    if (x1 === x2 && y1 === y2)
        return false;

    if (this._maxVertexCount - this._vertexCount < 4)
        this.flush();

    if (this._shape) {
        this._shape.add(transform, uno.Shape.LINE, new uno.Line(x1, y1, x2, y2),
            null, state.stroke, thickness, alpha, state.blend);
    }

    var color = state.stroke.packABGR(alpha);
    var w = state.thickness * 0.5;
    var a = transform.a, b = transform.b, c = transform.c, d = transform.d, tx = transform.tx, ty = transform.ty;
    var vc = this._vertexCount;
    var vi = vc * this._vertexSize;
    var ii = this._indexCount;
    var vx = this._positions;
    var cc = this._colors;
    var ix = this._indices;

    var px = y2 - y1;
    var py = x1 - x2;
    var l = Math.sqrt(px * px + py * py);
    px = px / l * w;
    py = py / l * w;

    vx[vi++] = a * (x1 - px) + b * (y1 - py) + tx;
    vx[vi++] = c * (x1 - px) + d * (y1 - py) + ty;
    cc[vi++] = color;

    vx[vi++] = a * (x1 + px) + b * (y1 + py) + tx;
    vx[vi++] = c * (x1 + px) + d * (y1 + py) + ty;
    cc[vi++] = color;

    vx[vi++] = a * (x2 + px) + b * (y2 + py) + tx;
    vx[vi++] = c * (x2 + px) + d * (y2 + py) + ty;
    cc[vi++] = color;

    vx[vi++] = a * (x2 - px) + b * (y2 - py) + tx;
    vx[vi++] = c * (x2 - px) + d * (y2 - py) + ty;
    cc[vi++] = color;

    ix[ii++] = vc + 0;
    ix[ii++] = vc + 1;
    ix[ii++] = vc + 2;
    ix[ii++] = vc + 0;
    ix[ii++] = vc + 3;
    ix[ii++] = vc + 2;
    vc += 4;

    this._vertexCount = vc;
    this._indexCount = ii;
    this._saveState(state.blend);
    if (this._vertexCount >= this._maxVertexCount)
        this.flush();
    return true;
};

/**
 * Draw rectangle
 * @param {uno.Matrix} transform - Current matrix transform
 * @param {Number} x - The x-coordinate of the left-top point of the rect
 * @param {Number} y - The y-coordinate of the left-top point of the rect
 * @param {Number} width - The rectangle width
 * @param {Number} height - The rectangle height
 * @param {Number} alpha - Rectangle opacity
 * @param {Number} blend - Rectangle blend mode
 * @returns {Boolean} - Is rectangle rendered
 */
uno.WebglGraphics.prototype.rect = function(x, y, width, height) {
    var state = this._render._state;
    var transform = state.transform;
    var alpha = state.alpha;
    var fill = state.fill;
    var stroke = state.stroke;
    var thickness = state.thickness;

    if (!alpha || (!fill.a && (!stroke.a || !thickness)))
        return false;

    if (width === 0 || height === 0)
        return false;

    if (this._maxVertexCount - this._vertexCount < 12)
        this.flush();

    if (this._shape) {
        this._shape.add(transform, uno.Shape.RECT, new uno.Rect(x, y, width, height),
            fill, stroke, thickness, alpha, state.blend);
    }

    var a = transform.a, b = transform.b, c = transform.c, d = transform.d, tx = transform.tx, ty = transform.ty;
    var vc = this._vertexCount;
    var vi = vc * this._vertexSize;
    var ii = this._indexCount;
    var vx = this._positions;
    var cc = this._colors;
    var ix = this._indices;
    var i, j;
    var w, color;

    if (fill.a) {
        color = fill.packABGR(alpha);
        i = vi;

        vx[vi++] = a * x + b * y + tx;
        vx[vi++] = c * x + d * y + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x + width) + b * y + tx;
        vx[vi++] = c * (x + width) + d * y + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x + width) + b * (y + height) + tx;
        vx[vi++] = c * (x + width) + d * (y + height) + ty;
        cc[vi++] = color;

        vx[vi++] = a * x + b * (y + height) + tx;
        vx[vi++] = c * x + d * (y + height) + ty;
        cc[vi++] = color;

        ix[ii++] = vc + 0;
        ix[ii++] = vc + 1;
        ix[ii++] = vc + 2;
        ix[ii++] = vc + 0;
        ix[ii++] = vc + 3;
        ix[ii++] = vc + 2;
        vc += 4;
    }

    if (thickness && stroke.a) {
        color = stroke.packABGR(alpha);
        w = thickness * 0.5;
        i = vi;

        vx[vi++] = a * (x - w) + b * (y - w) + tx;
        vx[vi++] = c * (x - w) + d * (y - w) + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x + w) + b * (y + w) + tx;
        vx[vi++] = c * (x + w) + d * (y + w) + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x - w + width) + b * (y + w) + tx;
        vx[vi++] = c * (x - w + width) + d * (y + w) + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x + w + width) + b * (y - w) + tx;
        vx[vi++] = c * (x + w + width) + d * (y - w) + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x + w + width) + b * (y + w + height) + tx;
        vx[vi++] = c * (x + w + width) + d * (y + w + height) + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x - w + width) + b * (y - w + height) + tx;
        vx[vi++] = c * (x - w + width) + d * (y - w + height) + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x + w) + b * (y - w + height) + tx;
        vx[vi++] = c * (x + w) + d * (y - w + height) + ty;
        cc[vi++] = color;

        vx[vi++] = a * (x - w) + b * (y + w + height) + tx;
        vx[vi++] = c * (x - w) + d * (y + w + height) + ty;
        cc[vi++] = color;

        for (j = 0; j < 4; ++j) {
            if (j) {
                ix[ii++] = vc + 0;
                ix[ii++] = vc + 1;
                ix[ii++] = vc + 2;
                ix[ii++] = vc + 0;
                ix[ii++] = vc + 3;
                ix[ii++] = vc + 2;
                vc += 2;
            } else {
                ix[ii++] = vc + 0;
                ix[ii++] = vc + 1;
                ix[ii++] = vc + 6;
                ix[ii++] = vc + 0;
                ix[ii++] = vc + 7;
                ix[ii++] = vc + 6;
            }
        }
        vc += 2;
    }

    this._vertexCount = vc;
    this._indexCount = ii;
    this._saveState(state.blend);

    if (this._vertexCount >= this._maxVertexCount)
        this.flush();

    return true;
};

/**
 * Draw circle
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @returns {Boolean} - Is circle rendered
 */
uno.WebglGraphics.prototype.circle = function(x, y, radius) {
    if (this._shape) {
        var state = this._render._state;

        if (!state.alpha || (!state.fill.a && (!state.stroke.a || !state.thickness)))
            return false;

        this._shape.add(state.transform, uno.Shape.CIRCLE, new uno.Circle(x, y, radius),
            state.fill, state.stroke, state.thickness, state.alpha, state.blend);
    }

    return this._drawEllipse(x, y, radius * 2, radius * 2);
};

/**
 * Draw ellipse
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @returns {Boolean} - Is ellipse rendered
 */
uno.WebglGraphics.prototype.ellipse = function(x, y, width, height) {
    if (this._shape) {
        var state = this._render._state;

        if (!state.alpha || (!state.fill.a && (!state.stroke.a || !state.thickness)))
            return false;

        this._shape.add(state.transform, uno.Shape.ELLIPSE, new uno.Ellipse(x, y, width, height),
            state.fill, state.stroke, state.thickness, state.alpha, state.blend);
    }

    return this._drawEllipse(x, y, width, height);
};

/**
 * Draw arc
 * @param {Number} x - The x-coordinate of the center of the arc
 * @param {Number} y - The y-coordinate of the center of the arc
 * @param {Number} radius - The radius of the arc
 * @param {Number} startAngle - The starting angle, in radians
 * @param {Number} endAngle - The ending angle, in radians
 * @param {Boolean} antiClockwise - Specifies whether the drawing should be counterclockwise or clockwise
 * @returns {Boolean} - Is arc rendered
 */
uno.WebglGraphics.prototype.arc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    var state = this._render._state;
    var transform = state.transform;
    var alpha = state.alpha;
    var fill = state.fill;
    var stroke = state.stroke;
    var thickness = state.thickness;

    if (!alpha || (!fill.a && (!stroke.a || !thickness)))
        return false;

    if (radius === 0 || startAngle === endAngle)
        return false;

    var pi2 = uno.Math.TWO_PI;
    if (startAngle > endAngle)
        endAngle = Math.floor(startAngle / pi2 + 1) * pi2 + endAngle % pi2;

    var angle = endAngle - startAngle;
    if (angle > pi2)
        angle %= pi2;
    if (antiClockwise)
        angle -= pi2;

    if (!angle)
        return false;

    if (this._shape) {
        this._shape.add(transform, uno.Shape.ARC, new uno.Arc(x, y, radius, startAngle, endAngle, antiClockwise),
            fill, stroke, thickness, alpha, state.blend);
    }

    var a = transform.a, b = transform.b, c = transform.c, d = transform.d, tx = transform.tx, ty = transform.ty;
    var color;
    var vc = this._vertexCount;
    var ii = this._indexCount;
    var vi = vc * this._vertexSize;
    var vx = this._positions;
    var cc = this._colors;
    var ix = this._indices;
    var i, k, sin, cos, sx, sy, px1, py1, px2, py2;

    var arc = angle !== pi2;
    var segments = Math.round(Math.round(this._smooth * Math.sqrt(Math.max(a * radius, d * radius))) / pi2 * (angle < 0 ? -angle : angle));
    var delta = angle / segments;
    if (arc)
        ++segments;

    if (this._maxVertexCount - this._vertexCount < segments * 3) {
        this.flush();
        vc = this._vertexCount;
        ii = this._indexCount;
        vi = vc * this._vertexSize;
    }

    if (fill.a) {
        color = fill.packABGR(alpha);
        px1 = radius;
        py1 = 0;

        if (startAngle % pi2 !== 0) {
            cos = Math.cos(startAngle);
            sin = Math.sin(startAngle);
            sx = px1;
            px1 = cos * sx - sin * py1;
            py1 = sin * sx + cos * py1;
        }

        cos = Math.cos(delta);
        sin = Math.sin(delta);
        k = vc;

        for (i = 0; i < segments; ++i) {
            sx = px1;
            if (i) {
                px1 = cos * sx - sin * py1;
                py1 = sin * sx + cos * py1;
            }
            sx = px1 + x;
            sy = py1 + y;

            vx[vi++] = a * sx + b * sy + tx;
            vx[vi++] = c * sx + d * sy + ty;
            cc[vi++] = color;

            if (i > 1) {
                ix[ii++] = k;
                ix[ii++] = vc - 1;
                ix[ii++] = vc;
            }
            ++vc;
        }
    }

    if (thickness && stroke.a) {
        color = stroke.packABGR(alpha);
        k = vc + segments * 2;
        thickness *= 0.5;
        px1 = radius - thickness;
        py1 = 0;
        px2 = radius + thickness;
        py2 = 0;

        if (startAngle % pi2 !== 0) {
            cos = Math.cos(startAngle);
            sin = Math.sin(startAngle);
            sx = px1;
            px1 = cos * sx - sin * py1;
            py1 = sin * sx + cos * py1;
            sx = px2;
            px2 = cos * sx - sin * py2;
            py2 = sin * sx + cos * py2;
        }

        cos = Math.cos(delta);
        sin = Math.sin(delta);

        for (i = 0; i < segments; ++i) {
            sx = px1;
            if (i) {
                px1 = cos * sx - sin * py1;
                py1 = sin * sx + cos * py1;
            }
            sx = px1 + x;
            sy = py1 + y;

            vx[vi++] = a * sx + b * sy + tx;
            vx[vi++] = c * sx + d * sy + ty;
            cc[vi++] = color;

            sx = px2;
            if (i) {
                px2 = cos * sx - sin * py2;
                py2 = sin * sx + cos * py2;
            }

            sx = px2 + x;
            sy = py2 + y;
            vx[vi++] = a * sx + b * sy + tx;
            vx[vi++] = c * sx + d * sy + ty;
            cc[vi++] = color;

            if (i) {
                ix[ii++] = vc - 2;
                ix[ii++] = vc - 1;
                ix[ii++] = vc;
                ix[ii++] = vc - 1;
                ix[ii++] = vc + 1;
                ix[ii++] = vc;
            } else if (!arc) {
                ix[ii++] = k - 2;
                ix[ii++] = k - 1;
                ix[ii++] = vc;
                ix[ii++] = k - 1;
                ix[ii++] = vc + 1;
                ix[ii++] = vc;
            }
            vc += 2;
        }
    }

    this._vertexCount = vc;
    this._indexCount = ii;
    this._saveState(state.blend);
    if (this._vertexCount >= this._maxVertexCount)
        this.flush();

    return true;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {Boolean} - Is polyline rendered
 */
uno.WebglGraphics.prototype.poly = function(points) {
    var state = this._render._state;
    var transform = state.transform;
    var alpha = state.alpha;
    var fill = state.fill;
    var stroke = state.stroke;
    var thickness = state.thickness;

    if (!alpha || (!fill.a && (!stroke.a || !thickness)))
        return false;

    var len = points.length;

    if (len < 2 || !alpha)
        return false;

    var p1, p2;
    var closed = points[0].equal(points[len - 1]);

    if (len === 2 || (len === 3 && closed)) {
        p1 = points[0];
        p2 = points[1];
        this.line(p1.x, p1.y, p2.x, p2.y);
        return true;
    }

    var vc = this._vertexCount;
    var vi = vc * this._vertexSize;
    var ii = this._indexCount;
    var vx = this._positions;
    var cc = this._colors;
    var ix = this._indices;

    if (this._maxVertexCount < points.length * 4)
        return false;

    if (this._maxVertexCount - this._vertexCount < points.length * 4) {
        this.flush();
        vc = this._vertexCount;
        ii = this._indexCount;
        vi = vc * this._vertexSize;
    }

    if (this._shape) {
        this._shape.add(transform, uno.Shape.POLY, new uno.Poly(points),
            fill, stroke, thickness, alpha, state.blend);
    }

    var a = transform.a, b = transform.b, c = transform.c, d = transform.d, tx = transform.tx, ty = transform.ty;
    var color;
    var p3, x1, y1, x2, y2, x3, y3, i, j, l, den;
    var px1, py1, px2, py2, px3, py3, ix1, iy1, ix2, iy2, dx1, dy1, dx2, dy2, dx3, dy3, dc;

    if (fill.a) {
        color = fill.packABGR(alpha);
        l = len;
        if (closed)
            --l;
        i = vi;

        var i0, i1, i2, found;
        var d00, d01, d02, d11, d12;
        var indices = this._polyIndices;

        indices.length = l;
        for (j = 0; j < l; ++j)
            indices[j] = j;
        j = 0;

        while (l > 3) {
            i0 = indices[(j + 0) % l];
            i1 = indices[(j + 1) % l];
            i2 = indices[(j + 2) % l];

            p1 = points[i0];
            p2 = points[i1];
            p3 = points[i2];
            px1 = p1.x;
            py1 = p1.y;
            px2 = p2.x;
            py2 = p2.y;
            px3 = p3.x;
            py3 = p3.y;

            found = false;
            if ((py1 - py2) * (px3 - px2) + (px2 - px1) * (py3 - py2) >= 0) {
                found = true;
                for (var k = 0; k < l; ++k) {
                    dc = indices[k];
                    if (dc === i0 || dc === i1 || dc === i2)
                        continue;
                    p1 = points[dc];
                    dx1 = px3 - px1;
                    dy1 = py3 - py1;
                    dx2 = px2 - px1;
                    dy2 = py2 - py1;
                    dx3 = p1.x - px1;
                    dy3 = p1.y - py1;

                    d00 = dx1 * dx1 + dy1 * dy1;
                    d01 = dx1 * dx2 + dy1 * dy2;
                    d02 = dx1 * dx3 + dy1 * dy3;
                    d11 = dx2 * dx2 + dy2 * dy2;
                    d12 = dx2 * dx3 + dy2 * dy3;

                    den = 1 / (d00 * d11 - d01 * d01);
                    dx1 = (d11 * d02 - d01 * d12) * den;
                    dy1 = (d00 * d12 - d01 * d02) * den;

                    if (dx1 >= 0 && dy1 >= 0 && dx1 + dy1 < 1) {
                        found = false;
                        break;
                    }
                }
            }
            if (found) {
                vx[vi++] = a * px1 + b * py1 + tx;
                vx[vi++] = c * px1 + d * py1 + ty;
                cc[vi++] = color;

                vx[vi++] = a * px2 + b * py2 + tx;
                vx[vi++] = c * px2 + d * py2 + ty;
                cc[vi++] = color;

                vx[vi++] = a * px3 + b * py3 + tx;
                vx[vi++] = c * px3 + d * py3 + ty;
                cc[vi++] = color;

                ix[ii++] = vc + 0;
                ix[ii++] = vc + 1;
                ix[ii++] = vc + 2;
                vc += 3;

                indices.splice((j + 1) % l, 1);
                l--;
                j = 0;
            } else if (j++ > 3 * l)
                break;
        }
        p1 = points[indices[0]];
        p2 = points[indices[1]];
        p3 = points[indices[2]];
        px1 = p1.x;
        py1 = p1.y;
        px2 = p2.x;
        py2 = p2.y;
        px3 = p3.x;
        py3 = p3.y;

        vx[vi++] = a * px1 + b * py1 + tx;
        vx[vi++] = c * px1 + d * py1 + ty;
        cc[vi++] = color;

        vx[vi++] = a * px2 + b * py2 + tx;
        vx[vi++] = c * px2 + d * py2 + ty;
        cc[vi++] = color;

        vx[vi++] = a * px3 + b * py3 + tx;
        vx[vi++] = c * px3 + d * py3 + ty;
        cc[vi++] = color;

        ix[ii++] = vc + 0;
        ix[ii++] = vc + 1;
        ix[ii++] = vc + 2;
        vc += 3;
    }

    if (thickness && stroke.a) {
        color = stroke.packABGR(alpha);
        p1 = points[0];
        p2 = points[len - 1];

        var w = thickness * 0.5;
        var cap;
        var fx1, fy1, fx2, fy2;

        closed = p1.x === p2.x && p1.y === p2.y;
        len -= 2;
        i = vi;

        for (j = closed ? -1 : 0; j < len; ++j) {
            p1 = j === -1 ? points[len] : points[j];
            p2 = points[j + 1];
            p3 = points[j + 2];
            x1 = p1.x;
            y1 = p1.y;
            x2 = p2.x;
            y2 = p2.y;
            x3 = p3.x;
            y3 = p3.y;

            dx1 = x2 - x1;
            dy1 = y2 - y1;
            dx2 = x2 - x3;
            dy2 = y2 - y3;
            dx3 = x1 - x3;
            dy3 = y1 - y3;

            py1 = x1 - x2;
            l = Math.sqrt(dy1 * dy1 + py1 * py1);
            px1 = dy1 / l * w;
            py1 = py1 / l * w;

            py3 = x3 - x2;
            l = Math.sqrt(dy2 * dy2 + py3 * py3);
            px3 = dy2 / l * w;
            py3 = py3 / l * w;

            px2 = px1 + px3;
            py2 = py1 + py3;
            dc = dy2 * dx1 - dx2 * dy1;

            if (dc) {
                den = (dx2 * (dy3 - py2) - dy2 * (dx3 - px2)) / dc;
                ix1 = x1 - px1 + den * dx1;
                iy1 = y1 - py1 + den * dy1;

                den = (dx2 * (dy3 + py2) - dy2 * (dx3 + px2)) / dc;
                ix2 = x1 + px1 + den * dx1;
                iy2 = y1 + py1 + den * dy1;
            } else {
                ix1 = x2 - px1;
                iy1 = y2 - py1;
                ix2 = x2 + px1;
                iy2 = y2 + py1;
            }

            dx1 = a * ix1 + b * iy1 + tx;
            dy1 = c * ix1 + d * iy1 + ty;
            dx2 = a * ix2 + b * iy2 + tx;
            dy2 = c * ix2 + d * iy2 + ty;
            ix1 = dx1;
            iy1 = dy1;
            ix2 = dx2;
            iy2 = dy2;

            dx2 = a * x2 + b * y2 + tx;
            dy2 = c * x2 + d * y2 + ty;
            cap = (ix1 - dx2) * (ix1 - dx2) + (iy1 - dy2) * (iy1 - dy2) > 10000;

            if (cap) {
                dx1 = a * (x2 + px3) + b * (y2 + py3) + tx;
                dy1 = c * (x2 + px3) + d * (y2 + py3) + ty;
                dx2 = a * (x2 - px3) + b * (y2 - py3) + tx;
                dy2 = c * (x2 - px3) + d * (y2 - py3) + ty;
            }

            if (j === -1) {
                fx1 = vx[vi++] = ix2;
                fy1 = vx[vi++] = iy2;
                cc[vi++] = color;

                fx2 = vx[vi++] = ix1;
                fy2 = vx[vi++] = iy1;
                cc[vi++] = color;

                vc += 2;
                continue;
            }

            if (!j && !closed) {
                vx[vi++] = a * (x1 + px1) + b * (y1 + py1) + tx;
                vx[vi++] = c * (x1 + px1) + d * (y1 + py1) + ty;
                cc[vi++] = color;

                vx[vi++] = a * (x1 - px1) + b * (y1 - py1) + tx;
                vx[vi++] = c * (x1 - px1) + d * (y1 - py1) + ty;
                cc[vi++] = color;

                vc += 2;
            }

            if (cap) {
                vx[vi++] = ix2;
                vx[vi++] = iy2;
                cc[vi++] = color;

                vx[vi++] = dx2;
                vx[vi++] = dy2;
                cc[vi++] = color;
            } else {
                vx[vi++] = ix2;
                vx[vi++] = iy2;
                cc[vi++] = color;

                vx[vi++] = ix1;
                vx[vi++] = iy1;
                cc[vi++] = color;
            }

            ix[ii++] = vc - 2 + 0;
            ix[ii++] = vc - 2 + 1;
            ix[ii++] = vc - 2 + 2;
            ix[ii++] = vc - 2 + (cap ? 1: 1);
            ix[ii++] = vc - 2 + 2;
            ix[ii++] = vc - 2 + 3;
            vc += 2;

            if (cap) {
                vx[vi++] = ix2;
                vx[vi++] = iy2;
                cc[vi++] = color;

                vx[vi++] = dx1;
                vx[vi++] = dy1;
                cc[vi++] = color;

                ix[ii++] = vc - 1 + 0;
                ix[ii++] = vc - 1 + 1;
                ix[ii++] = vc - 1 + 2;
                vc += 2;
            }

            if (j === len - 1) {
                if (closed) {
                    vx[vi++] = fx2;
                    vx[vi++] = fy2;
                } else {
                    vx[vi++] = a * (x3 - px3) + b * (y3 - py3) + tx;
                    vx[vi++] = c * (x3 - px3) + d * (y3 - py3) + ty;
                }
                cc[vi++] = color;
                if (closed) {
                    vx[vi++] = fx1;
                    vx[vi++] = fy1;
                } else {
                    vx[vi++] = a * (x3 + px3) + b * (y3 + py3) + tx;
                    vx[vi++] = c * (x3 + px3) + d * (y3 + py3) + ty;
                }
                cc[vi++] = color;

                ix[ii++] = vc - 2 + 0;
                ix[ii++] = vc - 2 + 1;
                ix[ii++] = vc - 2 + 2;
                ix[ii++] = vc - 2 + (closed ? 0 : 1);
                ix[ii++] = vc - 2 + 2;
                ix[ii++] = vc - 2 + 3;
                vc += 2;
            }
        }
    }

    this._vertexCount = vc;
    this._indexCount = ii;
    this._saveState(state.blend);
    if (this._vertexCount >= this._maxVertexCount)
        this.flush();

    return true;
};

/**
 * Helper for circle and ellipse rendering
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @returns {Boolean} - Is ellipse rendered
 * @private
 */
uno.WebglGraphics.prototype._drawEllipse = function(x, y, width, height) {
    var state = this._render._state;
    var transform = state.transform;
    var alpha = state.alpha;
    var fill = state.fill;
    var stroke = state.stroke;
    var thickness = state.thickness;

    if (!alpha || (!fill.a && (!stroke.a || !thickness)))
        return false;

    if (width === 0 || height === 0)
        return false;

    var a = transform.a, b = transform.b, c = transform.c, d = transform.d, tx = transform.tx, ty = transform.ty;
    var vc = this._vertexCount;
    var ii = this._indexCount;
    var vi = vc * this._vertexSize;
    var vx = this._positions;
    var cc = this._colors;
    var ix = this._indices;
    var j, k, px, py, sx, sy, px1, py1, w, angle;
    var delta, segments, sin, cos, scale;
    var color;
    width *= 0.5;
    height *= 0.5;

    px = Math.abs(a * width + b * height);
    py = Math.abs(c * width + d * height);

    segments = Math.round(this._smooth * Math.sqrt(Math.max(a * width, d * height)));
    delta = uno.Math.TWO_PI / segments;
    cos = Math.cos(delta);
    sin = Math.sin(delta);

    if (this._maxVertexCount - this._vertexCount < segments * 3 + 1) {
        this.flush();
        vc = this._vertexCount;
        ii = this._indexCount;
        vi = vc * this._vertexSize;
    }

    if (fill.a) {
        color = fill.packABGR(alpha);
        scale = height / width;

        vx[vi++] = a * x + b * y + tx;
        vx[vi++] = c * x + d * y + ty;
        cc[vi++] = color;

        k = vc;
        ++vc;
        px = width;
        py = 0;

        for (j = 0; j < segments; ++j) {
            sx = px;
            px = cos * sx - sin * py;
            py = sin * sx + cos * py;
            sx = px + x;
            sy = py * scale + y;

            vx[vi++] = a * sx + b * sy + tx;
            vx[vi++] = c * sx + d * sy + ty;
            cc[vi++] = color;

            ix[ii++] = k;
            ix[ii++] = j ? vc - 1 : k + segments;
            ix[ii++] = vc;
            ++vc;
        }
    }

    if (thickness && stroke.a) {
        color = stroke.packABGR(alpha);
        angle = 0;
        k = vc + segments * 2;
        w = thickness * 0.5;

        if (width === height) {
            px = width - w;
            py = 0;
            px1 = width + w;
            py1 = 0;
        }

        for (j = 0; j < segments; ++j) {
            if (width === height) {
                sx = px;
                px = cos * sx - sin * py;
                py = sin * sx + cos * py;
                sx = px + x;
                sy = py + y;
            } else {
                cos = Math.cos(angle);
                sin = Math.sin(angle);
                sx = cos * (width + w) + x;
                sy = sin * (height + w) + y;
            }

            vx[vi++] = a * sx + b * sy + tx;
            vx[vi++] = c * sx + d * sy + ty;
            cc[vi++] = color;

            if (width === height) {
                sx = px1;
                px1 = cos * sx - sin * py1;
                py1 = sin * sx + cos * py1;
                sx = px1 + x;
                sy = py1 + y;
            } else {
                sx = cos * (width - w) + x;
                sy = sin * (height - w) + y;
            }

            vx[vi++] = a * sx + b * sy + tx;
            vx[vi++] = c * sx + d * sy + ty;
            cc[vi++] = color;

            if (j) {
                ix[ii++] = vc - 2;
                ix[ii++] = vc - 1;
                ix[ii++] = vc;
                ix[ii++] = vc - 1;
                ix[ii++] = vc + 1;
                ix[ii++] = vc;
            } else {
                ix[ii++] = k - 2;
                ix[ii++] = k - 1;
                ix[ii++] = vc;
                ix[ii++] = k - 1;
                ix[ii++] = vc + 1;
                ix[ii++] = vc;
            }

            vc += 2;
            angle += delta;
        }
    }

    this._vertexCount = vc;
    this._indexCount = ii;
    this._saveState(state.blend);
    if (this._vertexCount >= this._maxVertexCount)
        this.flush();

    return true;
};

/**
 * Save blend mode state for batching
 * @param {Number} blend - Changed blend mode. See {@link uno.Render} constants
 * @private
 */
uno.WebglGraphics.prototype._saveState = function(blend) {
    blend = blend || uno.Render.BLEND_NORMAL;
    if (blend === this._stateBlendLast && this._stateCount) {
        this._states[this._stateCount - 1] = this._indexCount;
        return;
    }
    this._states[this._stateCount] = this._indexCount;
    this._stateBlends[this._stateCount] = blend;
    this._stateBlendLast = blend;
    ++this._stateCount;
};
