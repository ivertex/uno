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
    var defaults = uno.Render.DEFAULT_GRAPHICS;
    this._currentFillColor = defaults.fillColor.clone();
    this._currentLineColor = defaults.lineColor.clone();
    this._currentLineWidth = defaults.lineWidth;
};

/**
 * Free all allocated resources and destroy graphics
 */
uno.CanvasGraphics.prototype.destroy = function() {
    this._render = null;
    this._shape = null;
    this._shapeWorldMatrix = null;
    this._shapeTempMatrix = null;
    this._currentFillColor = null;
    this._currentLineColor = null;
};

/**
 * Set current shape fill color
 * @param {uno.Color} color - Shape fill color
 * @returns {uno.Color} - Current fill color
 */
uno.CanvasGraphics.prototype.fillColor = function(color) {
    if (color === undefined || this._currentFillColor.equal(color ? color : uno.Color.TRANSPARENT))
        return this._currentFillColor;
    this._render._context.fillStyle = this._currentFillColor.set(color ? color : uno.Color.TRANSPARENT).cssRGBA;
    return this._currentFillColor;
};

/**
 * Set current shape line color
 * @param {uno.Color} color - Shape line color
 * @returns {uno.Color} - Current line color
 */
uno.CanvasGraphics.prototype.lineColor = function(color) {
    if (color === undefined || this._currentLineColor.equal(color ? color : uno.Color.TRANSPARENT))
        return this._currentLineColor;
    this._render._context.strokeStyle = this._currentLineColor.set(color ? color : uno.Color.TRANSPARENT).cssRGBA;
    return this._currentLineColor;
};

/**
 * Set current shape line width
 * @param {Number} width - Shape line width
 * @returns {Number} - Current line width
 */
uno.CanvasGraphics.prototype.lineWidth = function(width) {
    if (width === undefined || width === null || width < 0)
        return this._currentLineWidth;
    this._render._context.lineWidth = width;
    return this._currentLineWidth = width;
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
    var world = this._shapeWorldMatrix.set(render._currentMatrix), temp = this._shapeTempMatrix;
    var worldEmpty = world.identity();
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    for (i = 0; i < l; ++i) {
        item = items[i];
        figure = item.shape;
        if (worldEmpty || !item._matrix)
            render.transform = item._matrix ? item._matrix : world;
        else {
            uno.Matrix.concat(item._matrix, world, temp);
            render.transform = temp;
        }
        this.lineColor(item.lineColor);
        this.lineWidth(item.lineWidth);
        render.fillColor(item.fillColor);
        render._setBlendMode(item.blendMode);
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
    this.lineColor(lineColor);
    this.lineWidth(lineWidth);
    render.fillColor(fillColor);
    render.transform = world;
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
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    if (!lineColor || !lineColor.a)
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentMatrix, uno.Shape.LINE,
            new uno.Line(x1, y1, x2, y2), null, lineColor, lineWidth, this._render._currentBlendMode);
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
uno.CanvasGraphics.prototype.drawRect = function(x, y, width, height) {
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentMatrix, uno.Shape.RECT,
            new uno.Rect(x, y, width, height), fillColor, lineColor, lineWidth, this._render._currentBlendMode);
        return false;
    }
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
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentMatrix, uno.Shape.CIRCLE,
            new uno.Circle(x, y, radius), fillColor, lineColor, lineWidth, this._render._currentBlendMode);
        return true;
    }
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
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentMatrix, uno.Shape.ELLIPSE,
            new uno.Ellipse(x, y, width, height), fillColor, lineColor, lineWidth, this._render._currentBlendMode);
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
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentMatrix, uno.Shape.ARC,
            new uno.Arc(x, y, radius, startAngle, endAngle, antiClockwise),
            fillColor, lineColor, lineWidth, this._render._currentBlendMode);
        return true;
    }
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
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (this._shape) {
        this._shape.add(this._render._currentMatrix, uno.Shape.POLY,
            new uno.Poly(points), fillColor, lineColor, lineWidth, this._render._currentBlendMode);
        return true;
    }
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