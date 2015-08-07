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
 * @param {uno.Matrix} transform - Transformation of the figure
 * @param {Number} type - The type of the figure
 * @param {uno.Point|uno.Line|uno.Rect|uno.Circle|uno.Ellipse|uno.Arc|uno.Poly} figure - The figure to add
 * @param {uno.Color} fill - Shape fill color
 * @param {uno.Color} stroke - Shape stroke color
 * @param {Number} thickness - Shape line width
 * @param {Number} alpha - Shape alpha
 * @param {Number} blend - Shape blend mode
 * @returns {uno.Shape} - <code>this</code>
 */
uno.Shape.prototype.add = function(transform, type, figure, fill, stroke, thickness, alpha, blend) {
    this.items.push({
        transform: transform.identity() ? null : transform.clone(),
        type: type,
        shape: figure,
        fill: fill ? fill.clone() : null,
        stroke: stroke ? stroke.clone() : null,
        thickness: thickness,
        alpha: alpha,
        blend: blend
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