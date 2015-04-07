/**
 * Class for holding list of geometric figures - shape
 * @constructor
 */
uno.Shape = function() {
    /**
     * @property {Array} items - Array of figures of the shape
     * @default []
     */
    this.items = [];
};

/**
 * Add new figure to the shape
 * @param {uno.Matrix} matrix - Transformation of the figure
 * @param {Number} type - The type of the figure
 * @param {uno.Point|uno.Line|uno.Rect|uno.Circle|uno.Ellipse|uno.Arc|uno.Poly} figure - The figure to add
 * @param {uno.Color} [fillColor=null] - Fill color of the figure for rendering (if null - do not change)
 * @param {uno.Color} [lineColor=null] - Line color of the figure for rendering (if null - do not change)
 * @param {Number} [lineWidth=null] - Line width of the figure for rendering (if null - do not change)
 * @param {Number} [blendMode=null] - Blend mode of the figure for rendering (if null - do not change)
 * @returns {uno.Shape} - <code>this</code>
 */
uno.Shape.prototype.add = function(matrix, type, figure, fillColor, lineColor, lineWidth, blendMode) {
    this.items.push({
        matrix: matrix.identity() ? null : matrix.clone(),
        type: type,
        shape: figure,
        fillColor: fillColor ? fillColor.clone() : null,
        lineColor: lineColor ? lineColor.clone() : null,
        lineWidth: lineWidth,
        blendMode: blendMode
    });
    return this;
};

/**
 * Figure is point
 * @const
 * @type {Number}
 */
uno.Shape.POINT = 0;

/**
 * Figure is line
 * @const
 * @type {Number}
 */
uno.Shape.LINE = 1;

/**
 * Figure is rect
 * @const
 * @type {Number}
 */
uno.Shape.RECT = 2;

/**
 * Figure is circle
 * @const
 * @type {Number}
 */
uno.Shape.CIRCLE = 3;

/**
 * Figure is ellipse
 * @const
 * @type {Number}
 */
uno.Shape.ELLIPSE = 4;

/**
 * Figure is arc
 * @const
 * @type {Number}
 */
uno.Shape.ARC = 5;

/**
 * Figure is poly
 * @const
 * @type {Number}
 */
uno.Shape.POLY = 6;