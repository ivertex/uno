/**
 * Canvas implementation for rendering graphics shapes
 * @param {uno.CanvasRender} render - Canvas render instance
 * @constructor
 */
uno.CanvasGraphics = function(render) {
    this._render = render;
    this._shape = null;
    this._shapeSavedTransform = new uno.Matrix();
    this._shapeItemTransform = new uno.Matrix();
    this._shapeFillColor = new uno.Color();
    this._shapeLineColor = new uno.Color();

    var defaults = uno.Render.DEFAULT_GRAPHICS;
    this.fillColor = defaults.fillColor.clone();
    this.lineColor = defaults.lineColor.clone();
    this.lineWidth = defaults.lineWidth;

    this._currentFillColor = new uno.Color();
    this._currentLineColor = new uno.Color();
    this._currentLineWidth = 0;
};

/**
 * Free all allocated resources and destroy graphics
 */
uno.CanvasGraphics.prototype.destroy = function() {
    this._render = null;
    this._shape = null;
    this._shapeSavedTransform = null;
    this._shapeItemTransform = null;
    this._shapeFillColor = null;
    this._shapeLineColor = null;

    this.fillColor = null;
    this.lineColor = null;

    this._currentFillColor = null;
    this._currentLineColor = null;
};

/**
 * Start collect new shape
 * @returns {uno.Shape} - Created shape
 */
uno.CanvasGraphics.prototype.startShape = function() {
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
 * @param {uno.Matrix} transform - Current matrix transform
 * @param {uno.Shape} shape - The shape for rendering
 * @param {Number} alpha - Shape opacity
 * @returns {Boolean} - Is shape rendered
 */
uno.CanvasGraphics.prototype.drawShape = function(transform, shape, alpha) {
    var i, items = shape.items, l = items.length, item;
    var types = uno.Shape, figure, render = this._render;
    var savedBlend = render.blend;
    var savedAlpha = render.alpha;
    var savedFillColor = this._shapeFillColor.set(this.fillColor);
    var savedLineColor = this._shapeLineColor.set(this.lineColor);
    var savedLineWidth = this.lineWidth;
    var savedTransform = this._shapeSavedTransform.set(render.transform);
    var itemTransform = this._shapeItemTransform;
    var emptyTransform = transform.identity();
    var itemAlpha;

    if (alpha < 0)
        alpha = 0;
    if (alpha > 1)
        alpha = 1;

    if (!alpha)
        return false;

    for (i = 0; i < l; ++i) {
        item = items[i];
        figure = item.shape;
        if (emptyTransform || !item.transform)
            itemTransform.set(item.transform ? item.transform : transform);
        else
            uno.Matrix.concat(item.transform, transform, itemTransform);

        if (item.fillColor)
            this.fillColor.set(item.fillColor);
        if (item.lineColor)
            this.lineColor.set(item.lineColor);
        this.lineWidth = item.lineWidth;

        itemAlpha = item.alpha * alpha;

        switch (item.type) {
            case types.LINE:
                this.drawLine(itemTransform, figure.x1, figure.y1, figure.x2, figure.y2, itemAlpha, item.blend);
                break;
            case types.RECT:
                this.drawRect(itemTransform, figure.x, figure.y, figure.width, figure.height, itemAlpha, item.blend);
                break;
            case types.CIRCLE:
                this.drawCircle(itemTransform, figure.x, figure.y, figure.radius, itemAlpha, item.blend);
                break;
            case types.ELLIPSE:
                this.drawEllipse(itemTransform, figure.x, figure.y, figure.width, figure.height, itemAlpha, item.blend);
                break;
            case types.ARC:
                this.drawArc(itemTransform, figure.x, figure.y, figure.radius, figure.startAngle, figure.endAngle,
                    figure.antiClockwise, itemAlpha, item.blend);
                break;
            case types.POLY:
                this.drawPoly(itemTransform, figure.points, itemAlpha, item.blend);
                break;
        }
    }

    this.fillColor.set(savedFillColor);
    this.lineColor.set(savedLineColor);
    this.lineWidth = savedLineWidth;

    render._setState(savedTransform, savedAlpha, savedBlend);

    return true;
};

/**
 * Draw line
 * @param {uno.Matrix} transform - Current matrix transform
 * @param {Number} x1 - The x-coordinate of the first point of the line
 * @param {Number} y1 - The y-coordinate of the first point of the line
 * @param {Number} x2 - The x-coordinate of the second point of the line
 * @param {Number} y2 - The y-coordinate of the second point of the line
 * @param {Number} alpha - Line opacity
 * @param {Number} blend - Line blend mode
 * @returns {Boolean} - Is line rendered
 */
uno.CanvasGraphics.prototype.drawLine = function(transform, x1, y1, x2, y2, alpha, blend) {
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;

    if (alpha < 0)
        alpha = 0;
    if (alpha > 1)
        alpha = 1;

    if (!alpha || !lineColor || !lineColor.a)
        return false;

    if (this._shape) {
        this._shape.add(transform, uno.Shape.LINE, new uno.Line(x1, y1, x2, y2), null,
            lineColor, lineWidth, alpha, blend);
        return true;
    }

    this._render._setState(transform, alpha, blend);
    this._setState(null, lineColor, lineWidth);

    var ctx = this._render._context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

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
uno.CanvasGraphics.prototype.drawRect = function(transform, x, y, width, height, alpha, blend) {
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;

    if (alpha < 0)
        alpha = 0;
    if (alpha > 1)
        alpha = 1;

    if (!alpha)
        return false;

    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;

    if (this._shape) {
        this._shape.add(transform, uno.Shape.RECT, new uno.Rect(x, y, width, height),
            fillColor, lineColor, lineWidth, alpha, blend);
        return true;
    }

    this._render._setState(transform, alpha, blend);
    this._setState(fillColor, lineColor, lineWidth);

    var ctx = this._render._context;
    if (fillColor && fillColor.a)
        ctx.fillRect(x, y, width, height);
    if (lineWidth && lineColor && lineColor.a)
        ctx.strokeRect(x, y, width, height);

    return true;
};

/**
 * Draw circle
 * @param {uno.Matrix} transform - Current matrix transform
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @param {Number} alpha - Circle opacity
 * @param {Number} blend - Circle blend mode
 * @returns {Boolean} - Is circle rendered
 */
uno.CanvasGraphics.prototype.drawCircle = function(transform, x, y, radius, alpha, blend) {
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;

    if (alpha < 0)
        alpha = 0;
    if (alpha > 1)
        alpha = 1;

    if (!alpha)
        return false;

    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;

    if (this._shape) {
        this._shape.add(transform, uno.Shape.CIRCLE, new uno.Circle(x, y, radius),
            fillColor, lineColor, lineWidth, alpha, blend);
        return true;
    }

    this._render._setState(transform, alpha, blend);
    this._setState(fillColor, lineColor, lineWidth);

    var ctx = this._render._context;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, uno.Math.TWO_PI, false);
    if (fillColor && fillColor.a)
        ctx.fill();
    if (lineWidth && lineColor && lineColor.a)
        ctx.stroke();

    return true;
};

/**
 * Draw ellipse
 * @param {uno.Matrix} transform - Current matrix transform
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @param {Number} alpha - Ellipse opacity
 * @param {Number} blend - Ellipse blend mode
 * @returns {Boolean} - Is ellipse rendered
 */
uno.CanvasGraphics.prototype.drawEllipse = function(transform, x, y, width, height, alpha, blend) {
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;

    if (alpha < 0)
        alpha = 0;
    if (alpha > 1)
        alpha = 1;

    if (!alpha)
        return false;

    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;

    if (this._shape) {
        this._shape.add(transform, uno.Shape.ELLIPSE, new uno.Ellipse(x, y, width, height),
            fillColor, lineColor, lineWidth, alpha, blend);
        return true;
    }

    this._render._setState(transform, alpha, blend);
    this._setState(fillColor, lineColor, lineWidth);

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
    if (fillColor && fillColor.a)
        ctx.fill();
    if (lineWidth && lineColor && lineColor.a)
        ctx.stroke();

    return true;
};

/**
 * Draw arc
 * @param {uno.Matrix} transform - Current matrix transform
 * @param {Number} x - The x-coordinate of the center of the arc
 * @param {Number} y - The y-coordinate of the center of the arc
 * @param {Number} radius - The radius of the arc
 * @param {Number} startAngle - The starting angle, in radians
 * @param {Number} endAngle - The ending angle, in radians
 * @param {Boolean} antiClockwise - Specifies whether the drawing should be counterclockwise or clockwise
 * @param {Number} alpha - Arc opacity
 * @param {Number} blend - Arc blend mode
 * @returns {Boolean} - Is arc rendered
 */
uno.CanvasGraphics.prototype.drawArc = function(transform, x, y, radius, startAngle, endAngle, antiClockwise, alpha, blend) {
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;

    if (alpha < 0)
        alpha = 0;
    if (alpha > 1)
        alpha = 1;

    if (!alpha)
        return false;

    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;

    if (this._shape) {
        this._shape.add(transform, uno.Shape.ARC,
            new uno.Arc(x, y, radius, startAngle, endAngle, antiClockwise),
            fillColor, lineColor, lineWidth, alpha, blend);
        return true;
    }

    this._render._setState(transform, alpha, blend);
    this._setState(fillColor, lineColor, lineWidth);

    var ctx = this._render._context;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, antiClockwise);

    if (fillColor && fillColor.a)
        ctx.fill();
    if (lineWidth && lineColor && lineColor.a)
        ctx.stroke();

    return true;
};

/**
 * Draw polyline
 * @param {uno.Matrix} transform - Current matrix transform
 * @param {uno.Point[]} points - The points of the polyline
 * @param {Number} alpha - Polyline opacity
 * @param {Number} blend - Polyline blend mode
 * @returns {Boolean} - Is polyline rendered
 */
uno.CanvasGraphics.prototype.drawPoly = function(transform, points, alpha, blend) {
    if (!points || points.length < 2)
        return false;

    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;

    if (alpha < 0)
        alpha = 0;
    if (alpha > 1)
        alpha = 1;

    if (!alpha)
        return false;

    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;

    if (this._shape) {
        this._shape.add(transform, uno.Shape.POLY, new uno.Poly(points),
            fillColor, lineColor, lineWidth, alpha, blend);
        return true;
    }

    this._render._setState(transform, alpha, blend);
    this._setState(fillColor, lineColor, lineWidth);

    var ctx = this._render._context;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (var i = 1, l = points.length; i < l; ++i)
        ctx.lineTo(points[i].x, points[i].y);

    if (points[0].equal(points[i - 1]))
        ctx.closePath();

    if (fillColor && fillColor.a)
        ctx.fill();
    if (lineWidth && lineColor && lineColor.a)
        ctx.stroke();

    return true;
};

/**
 * Reset graphics style
 * @private
 */
uno.CanvasGraphics.prototype._resetState = function() {
    var defaults = uno.Render.DEFAULT_GRAPHICS;
    this._setState(defaults.fillColor, defaults.lineColor, defaults.lineWidth);
    this._currentFillColor.set(defaults.fillColor);
    this._currentLineColor.set(defaults.lineColor);
    this._currentLineWidth = defaults.lineWidth;
};

/**
 * Set graphics style
 * @param {uno.Color} fillColor - Fill color
 * @param {uno.Color} lineColor - Line color
 * @param {Number} lineWidth - Line width
 * @param {Boolean} [force=false] - Do not check cache
 * @private
 */
uno.CanvasGraphics.prototype._setState = function(fillColor, lineColor, lineWidth, force) {
    if (fillColor && (force || !this._currentFillColor.equal(fillColor))) {
        this._render._context.fillStyle = fillColor.cssRGBA;
        this._currentFillColor.set(fillColor);
    }
    if (lineColor && (force || !this._currentLineColor.equal(lineColor))) {
        this._render._context.strokeStyle = lineColor.cssRGBA;
        this._currentLineColor.set(lineColor);
    }
    if (force || this._currentLineWidth !== lineWidth) {
        this._render._context.lineWidth = lineWidth;
        this._currentLineWidth = lineWidth;
    }
};