/**
 * Canvas implementation for rendering graphics shapes
 * @param {uno.CanvasRender} render - Canvas render instance
 * @constructor
 * @ignore
 */
uno.CanvasGraphics = function(render) {
    this._render = render;
    this._shape = null;
    this._shapeWorldTransform = new uno.Matrix();
};

/**
 * Free all allocated resources and destroy graphics
 */
uno.CanvasGraphics.prototype.destroy = function() {
    this._render = null;
    this._shape = null;
};

/**
 * Start collect new shape
 * @returns {uno.Shape} - Created shape
 */
uno.CanvasGraphics.prototype.beginShape = function() {
    this._shape = new uno.Shape();
    return this._shape;
};

/**
 * Finish collect new shape
 * @returns {uno.Shape} - Created shape
 */
uno.CanvasGraphics.prototype.endShape = function() {
    var shape = this._shape;
    this._shape = null;
    return shape;
};

/**
 * Draw previous created shape
 * @param {uno.Shape} shape - The shape for rendering
 * @returns {Boolean} - Is shape rendered
 */
uno.CanvasGraphics.prototype.shape = function(shape) {
    var i, figure, item;
    var items = shape.items;
    var l = items.length;
    var types = uno.Shape;
    var render = this._render;
    var state = render._state;

    state.save();

    var worldAlpha = state.alpha;
    var worldTransform = this._shapeWorldTransform.set(state.transform);
    var emptyTransform = worldTransform.identity();

    if (!state.alpha)
        return false;

    for (i = 0; i < l; ++i) {
        item = items[i];
        figure = item.shape;

        if (emptyTransform || !item.transform)
            state.transform.set(item.transform ? item.transform : worldTransform);
        else
            uno.Matrix.concat(item.transform, worldTransform, state.transform);

        if (item.fill)
            state.fill.set(item.fill);

        if (item.stroke)
            state.stroke.set(item.stroke);

        state.thickness = item.thickness;
        state.alpha = item.alpha * worldAlpha;
        state.blend = item.blend;

        state.sync();

        switch (item.type) {
            case types.LINE:
                this.line(figure.x1, figure.y1, figure.x2, figure.y2);
                break;
            case types.RECT:
                this.rect(figure.x, figure.y, figure.width, figure.height);
                break;
            case types.CIRCLE:
                this.circle(figure.x, figure.y, figure.radius);
                break;
            case types.ELLIPSE:
                this.ellipse(figure.x, figure.y, figure.width, figure.height);
                break;
            case types.ARC:
                this.arc(figure.x, figure.y, figure.radius, figure.startAngle, figure.endAngle, figure.antiClockwise);
                break;
            case types.POLY:
                this.poly(figure.points);
                break;
        }
    }

    state.restore();

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
uno.CanvasGraphics.prototype.line = function(x1, y1, x2, y2) {
    var state = this._render._state;

    if (!state.alpha || !state.stroke.a || !state.thickness)
        return false;

    if (this._shape) {
        this._shape.add(state.transform, uno.Shape.LINE, new uno.Line(x1, y1, x2, y2), null,
            state.stroke, state.thickness, state.alpha, state.blend);
        return true;
    }

    var ctx = this._render._context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    return true;
};

/**
 * Draw rectangle
 * @param {Number} x - The x-coordinate of the left-top point of the rect
 * @param {Number} y - The y-coordinate of the left-top point of the rect
 * @param {Number} width - The rectangle width
 * @param {Number} height - The rectangle height
 * @returns {Boolean} - Is rectangle rendered
 */
uno.CanvasGraphics.prototype.rect = function(x, y, width, height) {
    var state = this._render._state;

    if (!state.alpha || (!state.fill.a && (!state.stroke.a || !state.thickness)))
        return false;

    if (this._shape) {
        this._shape.add(state.transform, uno.Shape.RECT, new uno.Rect(x, y, width, height),
            state.fill, state.stroke, state.thickness, state.alpha, state.blend);
        return true;
    }

    var ctx = this._render._context;
    if (state.fill.a)
        ctx.fillRect(x, y, width, height);
    if (state.thickness && state.stroke.a)
        ctx.strokeRect(x, y, width, height);

    return true;
};

/**
 * Draw circle
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @returns {Boolean} - Is circle rendered
 */
uno.CanvasGraphics.prototype.circle = function(x, y, radius) {
    var state = this._render._state;

    if (!state.alpha || (!state.fill.a && (!state.stroke.a || !state.thickness)))
        return false;

    if (this._shape) {
        this._shape.add(state.transform, uno.Shape.CIRCLE, new uno.Circle(x, y, radius),
            state.fill, state.stroke, state.thickness, state.alpha, state.blend);
        return true;
    }

    var ctx = this._render._context;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, uno.Math.TWO_PI, false);

    if (state.fill.a)
        ctx.fill();
    if (state.thickness && state.stroke.a)
        ctx.stroke();

    return true;
};

/**
 * Draw ellipse
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @returns {Boolean} - Is ellipse rendered
 */
uno.CanvasGraphics.prototype.ellipse = function(x, y, width, height) {
    var state = this._render._state;

    if (!state.alpha || (!state.fill.a && (!state.stroke.a || !state.thickness)))
        return false;

    if (this._shape) {
        this._shape.add(state.transform, uno.Shape.ELLIPSE, new uno.Ellipse(x, y, width, height),
            state.fill, state.stroke, state.thickness, state.alpha, state.blend);
        return true;
    }

    var ctx = this._render._context;
    var kappa = 0.5522848;
    var w = width * 0.5;
    var h = height * 0.5;
    x -= w;
    y -= h;
    var ox = w * kappa;
    var oy = h * kappa;
    var xe = x + width;
    var ye = y + height;
    var xm = x + w;
    var ym = y + h;
    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

    if (state.fill.a)
        ctx.fill();
    if (state.thickness && state.stroke.a)
        ctx.stroke();

    return true;
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
uno.CanvasGraphics.prototype.arc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    var state = this._render._state;

    if (!state.alpha || (!state.fill.a && (!state.stroke.a || !state.thickness)))
        return false;

    if (this._shape) {
        this._shape.add(state.transform, uno.Shape.ARC, new uno.Arc(x, y, radius, startAngle, endAngle, antiClockwise),
            state.fill, state.stroke, state.thickness, state.alpha, state.blend);
        return true;
    }

    var ctx = this._render._context;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, antiClockwise);

    if (state.fill.a)
        ctx.fill();
    if (state.thickness && state.stroke.a)
        ctx.stroke();

    return true;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {Boolean} - Is polyline rendered
 */
uno.CanvasGraphics.prototype.poly = function(points) {
    if (!points || points.length < 2)
        return false;

    var state = this._render._state;

    if (!state.alpha || (!state.fill.a && (!state.stroke.a || !state.thickness)))
        return false;

    if (this._shape) {
        this._shape.add(state.transform, uno.Shape.POLY, new uno.Poly(points),
            state.fill, state.stroke, state.thickness, state.alpha, state.blend);
        return true;
    }

    var p, ctx = this._render._context;
    ctx.beginPath();
    p = points[0];
    ctx.moveTo(p.x, p.y);

    for (var i = 1, l = points.length; i < l; ++i) {
        p = points[i];
        ctx.lineTo(p.x, p.y);
    }

    if (points[0].equal(points[i - 1]))
        ctx.closePath();

    if (state.fill.a)
        ctx.fill();
    if (state.thickness && state.stroke.a)
        ctx.stroke();

    return true;
};