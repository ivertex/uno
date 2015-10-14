/**
 * uno.Poly class
 * @param {...Number|...uno.Point|Number[]|uno.Point[]|uno.Poly} [points] - Array of points, array of numbers or uno.Poly instance
 * @constructor
 */
uno.Poly = function(points) {
    /**
     * Array of points
     * @type {uno.Point[]}
     * @default []
     */
    this.points = [];

    if (points[0] !== undefined || points.points !== undefined)
        this.set(points);
    else
        this.set(Array.prototype.slice.call(arguments));
};

/**
 * Clone the poly and return copied instance
 * @returns {uno.Poly} The poly copy
 */
uno.Poly.prototype.clone = function() {
    return new uno.Poly(this.points);
};

/**
 * Set the poly properties
 * @param {...Number|...uno.Point|Number[]|uno.Point[]|uno.Poly} [points] - Array of points, array of numbers or uno.Poly instance
 * @returns {uno.Poly} <code>this</code>
 */
uno.Poly.prototype.set = function(points) {
    if (points.points !== undefined) {
        this.points = points.slice();
        return this;
    }
    if (!points[0])
        points = Array.prototype.slice.call(arguments);
    if (typeof points[0] === 'number') {
        var ps = [];
        for (var i = 0, l = points.length; i < l; i += 2)
            ps.push(new uno.Point(points[i], points[i + 1]));
        this.points = ps;
    } else
        this.points = points.slice();
    return this;
};

/**
 * Is the poly equal to given
 * @param {uno.Poly} poly - Poly for comparison
 * @returns {Boolean}
 */
uno.Poly.prototype.equal = function(poly) {
    if (!poly)
        return false;
    if (this.points.length !== poly.points.length)
        return false;
    var p1 = this.points, p2 = poly.points, i = p1.length;
    while (--i) {
        if (p1[i].x !== p2[i].x || p1[i].y !== p2[i].y)
            return false;
    }
    return true;
};

/**
 * Is the poly is closed (first point equal to the last point)
 * @returns {Boolean}
 */
uno.Poly.prototype.closed = function() {
    if (this.points.length < 3)
        return false;
    return this.points[0].equal(this.points[this.points.length - 1]);
};

/**
 * Is the poly contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x param is object and have property x it treated as uno.Point instance
 * @param {Number} y - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Poly.prototype.contains = function(x, y) {
    var inside = false;
    var points = this.points;
    var px = x;
    var py = y;
    if (x.x !== undefined) {
        px = x.x;
        py = x.y;
    }
    for (var i = 0, l = this.points.length, j = l - 1; i < l; j = ++i) {
        var pi = points[i];
        var pj = points[j];
        if (((pi.y > py) !== (pj.y > py)) && (px < (pj.x - pi.x) * (py - pi.y) / (pj.y - pi.y) + pi.x))
            inside = !inside;
    }
    return inside;
};