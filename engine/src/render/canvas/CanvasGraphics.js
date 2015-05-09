/**
 * Canvas implementation for rendering graphics shapes
 * @param {uno.CanvasRender} render - Canvas render instance
 * @constructor
 */
uno.CanvasGraphics = function(render) {
    this._render = render;
    this._shape = null;
    this._shapeWorldMatrix = new uno.Matrix();
    this._shapeTempMatrix = new uno.Matrix();
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
    this._shapeWorldMatrix = null;
    this._shapeTempMatrix = null;
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
 * @param {uno.Shape} shape - The shape for rendering
 * @returns {Boolean} - Is shape rendered
 */
uno.CanvasGraphics.prototype.drawShape = function(shape) {
    var i, items = shape.items, l = items.length, item;
    var types = uno.Shape, figure, render = this._render;
    var blendMode = render._currentBlendMode;
    var alpha = render._currentAlpha;
    var fillColor = this._shapeFillColor.set(this.fillColor);
    var lineColor = this._shapeLineColor.set(this.lineColor);
    var lineWidth = this.lineWidth;
    var worldMatrix = this._shapeWorldMatrix.set(render.transform);
    var tempMatrix = this._shapeTempMatrix;
    var emptyMatrix = worldMatrix.identity();

    for (i = 0; i < l; ++i) {
        item = items[i];
        figure = item.shape;
        if (emptyMatrix || !item._matrix)
            tempMatrix.set(item._matrix ? item._matrix : worldMatrix);
        else
            uno.Matrix.concat(item._matrix, worldMatrix, tempMatrix);

        if (item.fillColor)
            this.fillColor.set(item.fillColor);
        if (item.lineColor)
            this.lineColor.set(item.lineColor);
        this.lineWidth = item.lineWidth;

        render._setState(tempMatrix, item.alpha * alpha, item.blendMode);

        switch (item.type) {
            case types.LINE:
                this.drawLine(figure.x1, figure.y1, figure.x2, figure.y2);
                break;
            case types.RECT:
                this.drawRect(figure.x, figure.y, figure.width, figure.height);
                break;
            case types.CIRCLE:
                this.drawCircle(figure.x, figure.y, figure.radius);
                break;
            case types.ELLIPSE:
                this.drawEllipse(figure.x, figure.y, figure.width, figure.height);
                break;
            case types.ARC:
                this.drawArc(figure.x, figure.y, figure.radius, figure.startAngle, figure.endAngle, figure.antiClockwise);
                break;
            case types.POLY:
                this.drawPoly(figure.points);
                break;
        }
    }

    this.fillColor.set(fillColor);
    this.lineColor.set(lineColor);
    this.lineWidth = lineWidth;

    render._setState(worldMatrix, alpha, blendMode);
};

/**
 * Draw line
 * @param {Number} x1 - The x-coordinate of the first point of the line
 * @param {Number} y1 - The y-coordinate of the first point of the line
 * @param {Number} x2 - The x-coordinate of the second point of the line
 * @param {Number} y2 - The y-coordinate of the second point of the line
 * @returns {Boolean} - Is line rendered
 */
uno.CanvasGraphics.prototype.drawLine = function(x1, y1, x2, y2) {
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;
    if (!lineColor || !lineColor.a)
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentTransform, uno.Shape.LINE,
            new uno.Line(x1, y1, x2, y2), null, lineColor, lineWidth,
            this._render._currentAlpha, this._render._currentBlendMode);
        return true;
    }
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
 * @param {Number} x - The x-coordinate of the left-top point of the rect
 * @param {Number} y - The y-coordinate of the left-top point of the rect
 * @param {Number} width - The rectangle width
 * @param {Number} height - The rectangle height
 * @returns {Boolean} - Is rectangle rendered
 */
uno.CanvasGraphics.prototype.drawRect = function(x, y, width, height) {
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentTransform, uno.Shape.RECT,
            new uno.Rect(x, y, width, height), fillColor, lineColor, lineWidth,
            this._render._currentAlpha, this._render._currentBlendMode);
        return false;
    }
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
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @returns {Boolean} - Is circle rendered
 */
uno.CanvasGraphics.prototype.drawCircle = function(x, y, radius) {
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentTransform, uno.Shape.CIRCLE,
            new uno.Circle(x, y, radius), fillColor, lineColor, lineWidth,
            this._render._currentAlpha, this._render._currentBlendMode);
        return true;
    }
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
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @returns {Boolean} - Is ellipse rendered
 */
uno.CanvasGraphics.prototype.drawEllipse = function(x, y, width, height) {
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentTransform, uno.Shape.ELLIPSE,
            new uno.Ellipse(x, y, width, height), fillColor, lineColor, lineWidth,
            this._render._currentAlpha, this._render._currentBlendMode);
        return true;
    }
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
 * @param {Number} x - The x-coordinate of the center of the arc
 * @param {Number} y - The y-coordinate of the center of the arc
 * @param {Number} radius - The radius of the arc
 * @param {Number} startAngle - The starting angle, in radians
 * @param {Number} endAngle - The ending angle, in radians
 * @param {Boolean} antiClockwise - Specifies whether the drawing should be counterclockwise or clockwise
 * @returns {Boolean} - Is arc rendered
 */
uno.CanvasGraphics.prototype.drawArc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentTransform, uno.Shape.ARC,
            new uno.Arc(x, y, radius, startAngle, endAngle, antiClockwise),
            fillColor, lineColor, lineWidth,
            this._render._currentAlpha, this._render._currentBlendMode);
        return true;
    }
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
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {Boolean} - Is polyline rendered
 */
uno.CanvasGraphics.prototype.drawPoly = function(points) {
    if (!points || points.length < 2)
        return false;
    var fillColor = this.fillColor;
    var lineColor = this.lineColor;
    var lineWidth = this.lineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentTransform, uno.Shape.POLY,
            new uno.Poly(points), fillColor, lineColor, lineWidth,
            this._render._currentAlpha, this._render._currentBlendMode);
        return true;
    }
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