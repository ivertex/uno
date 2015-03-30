/**
 * A polyfill for requestAnimationFrame
 *
 * @method requestAnimationFrame
 */

/**
 * A polyfill for cancelAnimationFrame
 *
 * @method cancelAnimationFrame
 */

(function() {
    if (!window)
        return;

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

/**
 * A polyfill for Function.prototype.bind
 *
 * @method bind
 */

(function() {
    if (typeof Function.prototype.bind !== 'function') {
        Function.prototype.bind = (function () {
            var slice = Array.prototype.slice;
            return function (thisArg) {
                var target = this, boundArgs = slice.call(arguments, 1);

                if (typeof target !== 'function') throw new TypeError();

                function bound() {
                    var args = boundArgs.concat(slice.call(arguments));
                    target.apply(this instanceof bound ? this : thisArg, args);
                }

                bound.prototype = (function F(proto) {
                    if (proto) F.prototype = proto;
                    if (!(this instanceof F)) return new F();
                })(target.prototype);

                return bound;
            };
        })();
    }
})();
'use strict';

(function(){
    var root = this;
/**
 * UnoJS engine<br>
 * Desktop browser support: IE 9+, FF 4+, Chrome 4+, Opera 11.6+, Safari 5+<br>
 * Mobile browser support: iOS 4 Safari and other browsers (iPhone 4+, iPad 2+),<br>
 *      Android 2.2 Browser (Samsung Galaxy S+), Opera Mobile 11.50, Blackberry browser 7+, IE Mobile 10+<br>
 * Desktop WebGL mode support: IE 11+, FF 4+ (partial), Chrome 8+ (partial) 18+ (full),<br>
 *      Opera 12+ (partial) 15+ (full), Safari 5.1+ (partial) 8+ (full)<br>
 * Mobile WebGL mode support: iOS 8+, Blackberry 10+, Opera Mobile 12+, Chrome for Android 36+, Firefox for Android 31+<br>
 *      (partial) - Support listed as "partial" refers to the fact that not all users with these browsers have WebGL access.<br>
 *          This is due to the additional requirement for users to have up to date video drivers<br>
 *      (full) - All video cards supported<br>
 * Market Share (July 2014, http://caniuse.com/usage_table.php):<br>
 *      Chrome 4+ (33.76%), FF 4+ (13.34%), IE 9+ (12.76%), Safari 5+ (3.33%), Opera 11.6+ (0.95%), iOS Safari (7.08%),<br>
 *      Android Browser (6.74%), Chrome Android (6.35%) FF Android (0.13%) IE Mobile (0.43%), Blackberry Browser (0.01%)<br>
 * Total support include mobile browsers: 84.88% + 6.47% (most of not included browsers) ~= 91.35%
 * @namespace uno
 * @author Ruslan Murashko
 */
var uno = uno || {}; // jshint ignore:line

/**
 * Get current timestamp
 * @returns {Number}
 */
uno.time = function() {
    if (window && window.perfomance)
        return window.perfomance.now();
    return Date.now();
};

/**
 * Print log message
 * @param {...String} message - Message strings that will be concatenated
 * @returns {Boolean} - <code>true</code> for using with <code>return</code>
 */
uno.log = function() {
    if (uno.Browser.any && window.console) {
        console.log('%cUno: ' + Array.prototype.slice.call(arguments).join(' '), 'color: blue');
    }
    return true;
};

/**
 * Print warning message
 * @param {...String} message - Message strings that will be concatenated
 * @returns {Boolean} - <code>false</code> for using with <code>return</code>
 */
uno.warn = function() {
    if (uno.Browser.any && window.console) {
        console.warn('%cUno: ' + Array.prototype.slice.call(arguments).join(' '), 'color: orange');
    }
    return false;
};

/**
 * Print error message
 * @param {...String} message - Message strings that will be concatenated
 * @returns {Boolean} - <code>false</code> for using with <code>return</code>
 */
uno.error = function() {
    if (uno.Browser.any && window.console) {
        console.error('Uno: ' + Array.prototype.slice.call(arguments).join(' '));
    }
    return false;
};
/**
 * Utilites helpers
 * @namespace
 */
uno.Utils = {};
/**
 * uno.Arc class
 * @param {Number|uno.Arc} [x=0] - The x-coordinate of the center of the arc<br>
 *     If x is object it treated as uno.Arc instance
 * @param {Number} [y=0] - The y-coordinate of the center of the arc
 * @param {Number} [radius=0] - The radius of the arc
 * @param {Number} [startAngle=0] - The starting angle, in radians
 * @param {Number} [endAngle=uno.Math.TWO_PI] - The ending angle, in radians
 * @param {Boolean} [antiClockwise=false] - Specifies whether the drawing should be counterclockwise or clockwise
 * @constructor
 */
uno.Arc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    /**
     * The x-coordinate of the center of the arc
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the center of the arc
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    /**
     * The radius of the arc
     * @type {Number}
     * @default 0
     */
    this.radius = 0;

    /**
     * The starting angle, in radians
     * @type {Number}
     * @default 0
     */
    this.startAngle = 0;

    /**
     * The ending angle, in radians
     * @type {Number}
     * @default 0
     */
    this.endAngle = 0;

    /**
     * Specifies whether the drawing should be counterclockwise or clockwise
     * @type {Boolean}
     * @default false
     */
    this.antiClockwise = false;

    if (x !== undefined)
        this.set(x, y, radius, startAngle, endAngle, antiClockwise);
};

/**
 * Clone the arc and return copied instance
 * @returns {uno.Arc} The arc copy
 */
uno.Arc.prototype.clone = function() {
    return new uno.Arc(this);
};

/**
 * Set arc properties
 * @param {Number|uno.Arc} x - The x-coordinate of the center of the arc<br>
 *     If x is object it treated as uno.Arc instance
 * @param {Number} [y=0] - The y-coordinate of the center of the arc
 * @param {Number} [radius=0] - The radius of the arc
 * @param {Number} [startAngle=0] - The starting angle, in radians
 * @param {Number} [endAngle=uno.Math.TWO_PI] - The ending angle, in radians
 * @param {Boolean} [antiClockwise=false] - Specifies whether the drawing should be counterclockwise or clockwise
 * @return {uno.Arc} <code>this</code>
 */
uno.Arc.prototype.set = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    if (x !== undefined && x.x !== undefined) {
        this.x = x.x;
        this.y = x.y;
        this.radius = x.radius;
        this.startAngle = x.startAngle;
        this.endAngle = x.endAngle;
        this.antiClockwise = x.antiClockwise;
        return this;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius || 0;
    this.startAngle = startAngle || 0;
    this.endAngle = endAngle || uno.Math.TWO_PI;
    this.antiClockwise = antiClockwise || false;
    return this;
};

/**
 * Is the arc equal to given
 * @param {uno.Arc} arc - Arc for comparison
 * @returns {Boolean}
 */
uno.Arc.prototype.equal = function(arc) {
    return this.x === arc.x && this.y === arc.y && this.radius === arc.radius &&
        this.startAngle === arc.startAngle && this.endAngle === arc.endAngle &&
        this.antiClockwise === arc.antiClockwise;
};

/**
 * Is the arc contains point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Arc instance
 * @param {Number} y - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Arc.prototype.contains = function(x, y) {
    if (this.radius <= 0)
        return false;
    if (x.x !== undefined)
        return (this.x - x.x) * (this.x - x.x) + (this.y - x.y) * (this.y - x.y) <= this.radius * this.radius;
    return (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y) <= this.radius * this.radius;
};
/**
 * uno.Circle class
 * @param {Number|uno.Circle} [x=0] - The x-coordinate of the center of the circle<br>
 *     If x is object it treated as uno.Circle instance
 * @param {Number} [y=0] - The y-coordinate of the center of the circle
 * @param {Number} [radius=0] - The radius of the circle
 * @constructor
 */
uno.Circle = function(x, y, radius) {
    /**
     * The x-coordinate of the center of the circle
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the center of the circle
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    /**
     * The radius of the circle
     * @type {Number}
     * @default 0
     */
    this.radius = 0;

    if (x !== undefined)
        this.set(x, y, radius);
};

/**
 * Clone the circle and return copied instance
 * @returns {uno.Circle} The circle copy
 */
uno.Circle.prototype.clone = function() {
    return new uno.Circle(this);
};

/**
 * Set the circle properties
 * @param {Number|uno.Circle} x - The x-coordinate of the center of the circle<br>
 *     If x is object it treated as uno.Circle instance
 * @param {Number} [y=0] - The y-coordinate of the center of the circle
 * @param {Number} [radius=0] - The radius of the circle
 * @return {uno.Circle} <code>this</code>
 */
uno.Circle.prototype.set = function(x, y, radius) {
    if (x !== undefined && x.x !== undefined) {
        this.x = x.x;
        this.y = x.y;
        this.radius = x.radius;
        return this;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius || 0;
    return this;
};

/**
 * Is the circle equal to given
 * @param {uno.Circle} circle - Circle for comparison
 * @returns {Boolean}
 */
uno.Circle.prototype.equal = function(circle) {
    return this.x === circle.x && this.y === circle.y && this.radius === circle.radius;
};

/**
 * Is the circle contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Circle instance
 * @param {Number} [y] - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Circle.prototype.contains = function(x, y) {
    if (this.radius <= 0)
        return false;
    if (x.x !== undefined)
        return (this.x - x.x) * (this.x - x.x) + (this.y - x.y) * (this.y - x.y) <= this.radius * this.radius;
    return (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y) <= this.radius * this.radius;
};
/**
 * uno.Ellipse class
 * @param {Number|uno.Ellipse} [x=0] - The x-coordinate of the center of the ellipse<br>
 *     If x is object it treated as uno.Ellipse instance
 * @param {Number} [y=0] - The y-coordinate of the center of the ellipse
 * @param {Number} [width=0] - The width of the ellipse
 * @param {Number} [height=0] - The height of the ellipse
 * @constructor
 */
uno.Ellipse = function(x, y, width, height) {
    /**
     * The x-coordinate of the center of the ellipse
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the center of the ellipse
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    /**
     * The width of the ellipse
     * @type {Number}
     * @default 0
     */
    this.width = 0;

    /**
     * The height of the ellipse
     * @type {Number}
     * @default 0
     */
    this.height = 0;

    if (x !== undefined)
        this.set(x, y, width, height);
};

/**
 * Clone the ellipse and return copied instance
 * @returns {uno.Ellipse} The ellipse copy
 */
uno.Ellipse.prototype.clone = function() {
    return new uno.Ellipse(this);
};

/**
 * Set the ellipse properties
 * @param {Number|uno.Rect|uno.Ellipse} x - The x-coordinate of the center of the ellipse<br>
 *     If x param is object and have property width it treated as uno.Ellipse or uno.Rect instance<br>
 *     If x param is object and have property x it treated as uno.Point instance (center point)
 * @param {Number} [y=0] - The y-coordinate of the center of the ellipse<br>
 *     If y param is object and have property x it treated as uno.Point instance (width and height)
 * @param {Number} [width=0] - The width of the ellipse
 * @param {Number} [height=0] - The height of the ellipse
 * @return {uno.Ellipse} <code>this</code>
 */
uno.Ellipse.prototype.set = function(x, y, width, height) {
    if (x !== undefined) {
        if (x.width !== undefined) {
            this.x = x.x;
            this.y = x.y;
            this.width = x.width;
            this.height = x.height;
            return this;
        }
        if (x.x !== undefined) {
            this.x = x.x;
            this.y = x.y;
            this.width = y.x;
            this.height = y.y;
            return this;
        }
    }
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
    return this;
};

/**
 * Is the ellipse equal to given
 * @param {uno.Ellipse|uno.Circle} ellipse - Ellipse or circle for comparison
 * @returns {Boolean}
 */
uno.Ellipse.prototype.equal = function(ellipse) {
    if (ellipse.radius)
        return this.x === ellipse.x && this.y === ellipse.y && this.width === ellipse.radius && this.height === ellipse.radius;
    return this.x === ellipse.x && this.y === ellipse.y && this.width === ellipse.width && this.height === ellipse.height;
};

/**
 * Is the ellipse contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} y - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Ellipse.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0)
        return false;
    if (x.x !== undefined)
        return ((x.x - this.x) / this.width) * ((x.x - this.x) / this.width) + ((x.y - this.y) / this.height) * ((x.y - this.y) / this.height) <= 1;
    return ((x - this.x) / this.width) * ((x - this.x) / this.width) + ((y - this.y) / this.height) * ((y - this.y) / this.height) <= 1;
};
/**
 * uno.Line class
 * @param {Number|uno.Point|uno.Line} [x1=0] - The x-coordinate of the first point of the line<br>
 * If x2 param is undefined x1 is treated as uno.Point instance<br>
 * If y1 param is undefined x1 is treated as uno.Line instance
 * @param {Number|uno.Point} [y1=0] - The y-coordinate of the first point of the line<br>
 * If x2 param is undefined x1 is treated as uno.Point instance
 * @param {Number} [x2=0] - The x-coordinate of the second point of the line
 * @param {Number} [y2=0] - The y-coordinate of the second point of the line
 * @constructor
 */
uno.Line = function(x1, y1, x2, y2) {
    /**
     * The x-coordinate of the first point of the line
     * @type {Number}
     * @default 0
     */
    this.x1 = 0;

    /**
     * The y-coordinate of the first point of the line
     * @type {Number}
     * @default 0
     */
    this.y1 = 0;

    /**
     * The x-coordinate of the second point of the line
     * @type {Number}
     * @default 0
     */
    this.x2 = 0;

    /**
     * The y-coordinate of the second point of the line
     * @type {Number}
     * @default 0
     */
    this.y2 = 0;

    if (x1 !== undefined)
        this.set(x1, y1, x2, y2);
};

/**
 * Clone the line and return copied instance
 * @returns {uno.Line} The line copy
 */
uno.Line.prototype.clone = function() {
    return new uno.Line(this.x1, this.y1, this.x2, this.y2);
};

/**
 * Set the line properties
 * @param {Number|uno.Point|uno.Line} [x1=0] - The x-coordinate of the first point of the line<br>
 *     If x1 param is object and have x1 property it treated as uno.Line instance<br>
 *     If x1 param is object and have x property it treated as uno.Point instance<br>
 * @param {Number|uno.Point} [y1=0] - The y-coordinate of the first point of the line<br>
 *     If y1 param is object and have x property it treated as uno.Point instance<br>
 * @param {Number} [x2=0] - The x-coordinate of the second point of the line
 * @param {Number} [y2=0] - The y-coordinate of the second point of the line
 * @return {uno.Line} <code>this</code>
 */
uno.Line.prototype.set = function(x1, y1, x2, y2) {
    if (x1 !== undefined && x1.x1 !== undefined) {
        this.x1 = x1.x1;
        this.y1 = x1.y1;
        this.x2 = x1.x2;
        this.y2 = x1.y2;
        return this;
    }
    if (x1 !== undefined && x1.x !== undefined) {
        this.x1 = x1.x;
        this.y1 = x1.y;
        this.x2 = y1.x;
        this.y2 = y1.y;
        return this;
    }
    this.x1 = x1 || 0;
    this.y1 = y1 || 0;
    this.x2 = x2 || 0;
    this.y2 = y2 || 0;
    return this;
};

/**
 * Is the line equal to given
 * @param {uno.Line} line - Line for comparison
 * @returns {Boolean}
 */
uno.Line.prototype.equal = function(line) {
    return this.x1 === line.x1 && this.y1 === line.y1 && this.x2 === line.x2 && this.y2 === line.y2;
};

/**
 * Is the line contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x param is object and have x property it treated as uno.Point instance<br>
 * @param {Number} y - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Line.prototype.contains = function(x, y) {
    if (x.x !== undefined)
        return x.x >= Math.min(this.x1, this.x2) && x.x <= Math.max(this.x1, this.x2) &&
            x.y >= Math.min(this.y1, this.y2) && x.y <= Math.max(this.y1, this.y2) &&
            ((x.x - this.x1) * (this.y2 - this.y1) === (this.x2 - this.x1) * (x.y - this.y1));
    return x >= Math.min(this.x1, this.x2) && x <= Math.max(this.x1, this.x2) &&
        y >= Math.min(this.y1, this.y2) && y <= Math.max(this.y1, this.y2) &&
        ((x - this.x1) * (this.y2 - this.y1) === (this.x2 - this.x1) * (y - this.y1));
};
/**
 * uno.Matrix class<br>
 *     Here is a representation of it:<br>
 *     | a | b | tx|<br>
 *     | c | d | ty|<br>
 *     | 0 | 0 | 1 |
 * @param {Number|uno.Matrix} [a=1] - If a param have property a it treated as uno.Matrix instance
 * @param {Number} [b=0]
 * @param {Number} [c=0]
 * @param {Number} [d=1]
 * @param {Number} [tx=0]
 * @param {Number} [ty=0]
 * @constructor
 */
uno.Matrix = function(a, b, c, d, tx, ty) {
    /**
     * @name uno.Matrix#a
     * @type {Number}
     * @default 1
     */
    this.a = 1;

    /**
     * @name uno.Matrix#b
     * @type {Number}
     * @default 0
     */
    this.b = 0;

    /**
     * @name uno.Matrix#c
     * @type {Number}
     * @default 0
     */
    this.c = 0;

    /**
     * @name uno.Matrix#d
     * @type {Number}
     * @default 1
     */
    this.d = 1;

    /**
     * @name uno.Matrix#tx
     * @type {Number}
     * @default 0
     */
    this.tx = 0;

    /**
     * @name uno.Matrix#ty
     * @type {Number}
     * @default 0
     */
    this.ty = 0;

    /**
     * Cached rotation value for transform method
     * @name uno.Matrix#_rotation
     * @type {Number}
     * @private
     */
    this._rotation = 0;

    /**
     * Cached sin value for _rotation
     * @name uno.Matrix#_sin
     * @type {Number}
     * @private
     */
    this._sin = 0;

    /**
     * Cached cos value for _rotation
     * @name uno.Matrix#_cos
     * @type {Number}
     * @private
     */
    this._cos = 1;

    if (a !== undefined)
        this.set(a, b, c, d, tx, ty);
};

/**
 * Clone the matrix and return copied instance
 * @returns {uno.Matrix} - The matrix copy
 */
uno.Matrix.prototype.clone = function() {
    return new uno.Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

/**
 * Set the matrix properties
 * @param {Number|uno.Matrix} [a=1] - If a param have property a it treated as uno.Matrix instance
 * @param {Number} [b=0]
 * @param {Number} [c=0]
 * @param {Number} [d=1]
 * @param {Number} [tx=0]
 * @param {Number} [ty=0]
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.set = function(a, b, c, d, tx, ty) {
    if (a !== undefined && a.a !== undefined) {
        this.a = a.a;
        this.b = a.b;
        this.c = a.c;
        this.d = a.d;
        this.tx = a.tx;
        this.ty = a.ty;
        return this;
    }
    this.a = a || 1;
    this.b = b || 0;
    this.c = c || 0;
    this.d = d || 1;
    this.tx = tx || 0;
    this.ty = ty || 0;
    return this;
};

/**
 * Set the matrix to identity
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.reset = function() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
    return this;
};

/**
 * Is the matrix equal to given
 * @param {uno.Matrix} matrix - Matrix for comparison
 * @returns {Boolean}
 */
uno.Matrix.prototype.equal = function(matrix) {
    return this.a === matrix.a && this.b === matrix.b && this.c === matrix.c &&
        this.d === matrix.d && this.tx === matrix.tx && this.ty === matrix.ty;
};

/**
 * Is the matrix equal to identity
 * @returns {Boolean}
 */
uno.Matrix.prototype.identity = function() {
    return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 &&
        this.tx === 0 && this.ty === 0;
};

/**
 * Return matrix representation as array
 * @returns {Number[]}
 */
uno.Matrix.prototype.array = function() {
    var arr = this._array;
    if (!arr)
        arr = this._array = new Float32Array(6);
    arr[0] = this.a;
    arr[1] = this.b;
    arr[2] = this.c;
    arr[3] = this.d;
    arr[4] = this.tx;
    arr[5] = this.ty;
    return arr;
};

/**
 * Transform matrix using arguments
 * @param {uno.Point} position - Translate
 * @param {uno.Point} scale - Scale
 * @param {Number} rotation - Rotate
 * @param {uno.Point} pivot - Pivot
 * @param {uno.Matrix} parentMatrix - Parent matrix if exists
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.transform = function(position, scale, rotation, pivot, parentMatrix) {
    if (this._rotation !== rotation) {
        this._sin = Math.sin(rotation);
        this._cos = Math.cos(rotation);
        this._rotation = rotation;
    }
    parentMatrix = parentMatrix || uno.Matrix.IDENTITY;
    var a00 = this._cos * scale.x,
        a01 = -this._sin * scale.y,
        a10 = this._sin * scale.x,
        a11 = this._cos * scale.y,
        a02 = position.x - a00 * pivot.x - pivot.y * a01,
        a12 = position.y - a11 * pivot.y - pivot.x * a10,
        b00 = parentMatrix.a, b01 = parentMatrix.b,
        b10 = parentMatrix.c, b11 = parentMatrix.d;
    this.a = b00 * a00 + b01 * a10;
    this.b = b00 * a01 + b01 * a11;
    this.tx = b00 * a02 + b01 * a12 + parentMatrix.tx;
    this.c = b10 * a00 + b11 * a10;
    this.d = b10 * a01 + b11 * a11;
    this.ty = b10 * a02 + b11 * a12 + parentMatrix.ty;
    return this;
};

/**
 * Apply matrix transformation to point
 * @param {uno.Point} point - Point to transform
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.apply = function(point) {
    var x = this.a * point.x + this.b * point.y + this.tx;
    point.y = this.c * point.x + this.d * point.y + this.ty;
    point.x = x;
    return this;
};

/**
 * Get a new position with the inverse of the current transformation applied
 * @param {uno.Point} point - Point to transform
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.applyInverse = function(point) {
    var id = 1 / (this.a * this.d + this.c * -this.b);
    var x = this.d * id * point.x + -this.c * id * point.y + (this.ty * this.c - this.tx * this.d) * id;
    point.y = this.a * id * point.y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;
    point.x = x;
    return this;
};

/**
 * Translates the matrix on the x and y
 * @param {Number|uno.Point} x - The x offset<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} y
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.translate = function(x, y) {
    if (x.x !== undefined) {
        this.tx += x.x;
        this.ty += x.y;
        return this;
    }
    this.tx += x;
    this.ty += y || x;
    return this;
};

/**
 * Applies a scale transformation to the matrix
 * @param {Number|uno.Point} x - The amount to scale horizontally<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} y - The amount to scale vertically
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.scale = function(x, y) {
    this.a *= x;
    this.d *= y || x;
    this.c *= x;
    this.b *= y || x;
    this.tx *= x;
    this.ty *= y || x;
    return this;
};

/**
 * Applies a rotation transformation to the matrix
 * @param {Number} angle - The angle in radians
 * @param {Number|uno.Point} x - the x-coordinate of the anchor point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} y - the y-coordinate of the anchor point
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.rotate = function(angle, x, y) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var a1 = this.a;
    var c1 = this.c;
    var tx1 = this.tx;
    // TODO: Find correct rotate around code
    if (x && y) {
        tx1 = x - x * cos + y * sin;
        this.ty = y - x * sin - y * cos;
    }
    this.a = a1 * cos - this.b * sin;
    this.b = a1 * sin + this.b * cos;
    this.c = c1 * cos - this.d * sin;
    this.d = c1 * sin + this.d * cos;
    this.tx = tx1 * cos - this.ty * sin;
    this.ty = tx1 * sin + this.ty * cos;
    return this;
};

/**
 * Appends the given Matrix to this Matrix.
 * @param {uno.Matrix} matrix - Matrix to append
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.append = function(matrix) {
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    this.a = matrix.a * a1 + matrix.b * c1;
    this.b = matrix.a * b1 + matrix.b * d1;
    this.c = matrix.c * a1 + matrix.d * c1;
    this.d = matrix.c * b1 + matrix.d * d1;
    this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
    this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;
    return this;
};

/**
 * Prepends the given Matrix to this Matrix.
 * @param {uno.Matrix} matrix - Matrix to prepend
 * @return {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.prepend = function(matrix) {
    var tx1 = this.tx;
    if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
        var a1 = this.a;
        var c1 = this.c;
        this.a  = a1 * matrix.a + this.b * matrix.c;
        this.b  = a1 * matrix.b + this.b * matrix.d;
        this.c  = c1 * matrix.a + this.d * matrix.c;
        this.d  = c1 * matrix.b + this.d * matrix.d;
    }
    this.tx = tx1 * matrix.a + this.ty * matrix.c + matrix.tx;
    this.ty = tx1 * matrix.b + this.ty * matrix.d + matrix.ty;
    return this;
};

/**
 * Inverts this matrix
 * @return {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.invert = function() {
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    var tx1 = this.tx;
    var n = a1 * d1 - b1 * c1;
    this.a = d1 / n;
    this.b = -b1 / n;
    this.c = -c1 / n;
    this.d = a1 / n;
    this.tx = (c1 * this.ty - d1 * tx1) / n;
    this.ty = -(a1 * this.ty - b1 * tx1) / n;
    return this;
};

/**
 * Concat two matrices
 * @param {uno.Matrix} m1 - First matrix to concat
 * @param {uno.Matrix} m2 - Second matrix to concat
 * @param {uno.Matrix} res - Result matrix
 * @static
 */
uno.Matrix.concat = function(m1, m2, res) {
    var a00 = m1.a, a01 = m1.b, a10 = m1.c, a11 = m1.d, a02 = m1.tx, a12 = m1.ty;
    var b00 = m2.a, b01 = m2.b, b10 = m2.c, b11 = m2.d, b02 = m2.tx, b12 = m2.ty;
    res.a = b00 * a00 + b01 * a10;
    res.b = b00 * a01 + b01 * a11;
    res.tx = b00 * a02 + b01 * a12 + b02;
    res.c = b10 * a00 + b11 * a10;
    res.d = b10 * a01 + b11 * a11;
    res.ty = b10 * a02 + b11 * a12 + b12;
};

/**
 * @const {uno.Matrix} - Identity matrix
 */
uno.Matrix.IDENTITY = new uno.Matrix();
/**
 * uno.Point class
 * @param {Number|uno.Point} [x] - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @constructor
 */
uno.Point = function(x, y) {
    /**
     * The x-coordinate of the point
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the point
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    if (x !== undefined)
        this.set(x, y);
};

/**
 * Clone the point and return copied instance
 * @returns {uno.Point} The point copy
 */
uno.Point.prototype.clone = function() {
    return new uno.Point(this);
};

/**
 * Set point properties
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} <code>this</code>
 */
uno.Point.prototype.set = function(x, y) {
    if (x === undefined) {
        this.x = this.y = 0;
        return this;
    }
    if (x.x !== undefined) {
        this.x = x.x;
        this.y = x.y;
        return this;
    }
    this.x = x || 0;
    this.y = y === undefined ? this.x : y;
    return this;
};

/**
 * Adds the given x and y values
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.add = function(x, y) {
    if (x === undefined)
        return this;
    if (x.x !== undefined) {
        this.x += x.x;
        this.y += x.y;
        return this;
    }
    this.x += x;
    this.y += y === undefined ? x : y;
    return this;
};

/**
 * Subtracts the given x and y values
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.subtract = function(x, y) {
    if (x === undefined)
        return this;
    if (x.x !== undefined) {
        this.x -= x.x;
        this.y -= x.y;
        return this;
    }
    this.x -= x;
    this.y -= y === undefined ? x : y;
    return this;
};

/**
 * Multiplies the given x and y values
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.multiply = function(x, y) {
    if (x === undefined) {
        this.x = this.y = 0;
        return this;
    }
    if (x.x !== undefined) {
        this.x *= x.x;
        this.y *= x.y;
        return this;
    }
    this.x *= x;
    this.y *= y === undefined ? x : y;
    return this;
};

/**
 * Divides the given x and y values
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.divide = function(x, y) {
    if (x === undefined)
        return this;
    if (x.x !== undefined) {
        this.x /= x.x;
        this.y /= x.y;
        return this;
    }
    this.x /= x;
    this.y /= y === undefined ? x : y;
    return this;
};

/**
 * Normalize point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.normalize = function() {
    if (this.zero())
        return this;
    var l = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= l;
    this.y /= l;
    return this;
};

/**
 * Invert point
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.invert = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
};

/**
 * Clamp point
 * @param {Number} from - Start clamp value
 * @param {Number} to - End clamp value
 * @return {uno.Point} - <code>this</code>
 */
uno.Point.prototype.clamp = function(from, to) {
    if (this.x < from)
        this.x = from;
    else if (this.x > to)
        this.x = to;
    if (this.y < from)
        this.y = from;
    else if (this.y > to)
        this.y = to;
    return this;
};

/**
 * Returns the distance between this and given points<br>
 *     With no arguments distance from 0,0 returned
 * @param {Number|uno.Point} [x] - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {Number}
 */
uno.Point.prototype.distance = function(x, y) {
    if (x === undefined)
        return Math.sqrt(this.x * this.x + this.y * this.y);
    if (x.x !== undefined)
        return Math.sqrt((x.x - this.x) * (x.x - this.x) + (x.y - this.y) * (x.y - this.y));
    return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
};

/**
 * Returns the angle between this and given points
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {Number}
 */
uno.Point.prototype.angle = function(x, y) {
    if (x === undefined)
        return Math.atan2(-this.y, -this.x);
    if (x.x !== undefined)
        return Math.atan2(x.y - this.y, x.x - this.x);
    return Math.atan2(y - this.y, x - this.x);
};

/**
 * Is point is equal to given
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @return {Boolean}
 */
uno.Point.prototype.equal = function(x, y) {
    if (x.x !== undefined)
        return this.x === x.x && this.y === x.y;
    return this.x === x && this.y === y;
};

/**
 * Is the point x and y coordinates equal zero
 * @returns {Boolean}
 */
uno.Point.prototype.zero = function() {
    return this.x === 0 && this.y === 0;
};
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
/**
 * uno.Rect class
 * @param {Number|uno.Point|uno.Rect} [x=0] - The x-coordinate of the left-top point of the rect<br>
 *     If x param is object and have property width it treated as uno.Rect instance<br>
 *     If x param is object and have property x it treated as uno.Point instance (position of the rect)
 * @param {Number|uno.Point} [y=0] - The y-coordinate of the left-top point of the rect<br>
 *     If y param is object and have property x it treated as uno.Point instance (size of the rect)
 * @param {Number} [width=0] - The width of the rect
 * @param {Number} [height=0] - The height of the rect
 * @constructor
 */
uno.Rect = function(x, y, width, height) {
    /**
     * The x-coordinate of the left-top point of the rect
     * @type {Number}
     * @default 0
     */
    this.x = 0;

    /**
     * The y-coordinate of the left-top point of the rect
     * @type {Number}
     * @default 0
     */
    this.y = 0;

    /**
     * The width of the rect
     * @type {Number}
     * @default 0
     */
    this.width = 0;

    /**
     * The height of the rect
     * @type {Number}
     * @default 0
     */
    this.height = 0;

    if (x !== undefined)
        this.set(x, y, width, height);
};

/**
 * Clone the rect and return copied instance
 * @returns {uno.Rect} The rect copy
 */
uno.Rect.prototype.clone = function() {
    return new uno.Rect(this.x, this.y, this.width, this.height);
};

/**
 * Set the rect properties
 * @param {Number|uno.Point|uno.Rect} [x=0] - The x-coordinate of the left-top point of the rect<br>
 *     If x param is object and have property width it treated as uno.Rect instance<br>
 *     If x param is object and have property x it treated as uno.Point instance (left-top point)
 * @param {Number|uno.Point} [y=0] - The y-coordinate of the left-top point of the rect<br>
 *     If y param is object and have property x it treated as uno.Point instance (width-height)
 * @param {Number} [width=0] - The width of the rect
 * @param {Number} [height=0] - The height of the rect
 * @returns {uno.Rect} <code>this</code>
 */
uno.Rect.prototype.set = function(x, y, width, height) {
    if (x !== undefined) {
        if (x.width !== undefined) {
            this.x = x.x;
            this.y = x.y;
            this.width = x.width;
            this.height = x.height;
            return this;
        }
        if (x.x !== undefined) {
            this.x = x.x;
            this.y = x.y;
            this.width = y.x;
            this.height = y.y;
            return this;
        }
    }
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
    return this;
};

/**
 * Is the rect equal to given
 * @param {uno.Rect} rect - Rect for comparison
 * @returns {Boolean}
 */
uno.Rect.prototype.equal = function(rect) {
    return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
};

/**
 * Is the rect contains given point
 * @param {Number|uno.Point} x - The x-coordinate of the point<br>
 *     If x is object it treated as uno.Point instance
 * @param {Number} [y] - The y-coordinate of the point
 * @returns {Boolean}
 */
uno.Rect.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0)
        return false;
    if (x.x !== undefined)
        return this.x <= x.x && this.y <= x.y && this.x + this.width >= x.x && this.y + this.height >= x.y;
    return this.x <= x && this.y <= y && this.x + this.width >= x && this.y + this.height >= y;
};
/**
 * Browser information
 * @namespace
 */
uno.Browser = function() {
    /**
     * @memberof uno.Browser
     * @member {Boolean} any - Current environment is any browser
     * @readonly
     */
    this.any = false;

    /**
     * @memberof uno.Browser
     * @member {Number} version - Version of the current browser
     * @readonly
     */
    this.version = 0;

    /**
     * @memberof uno.Browser
     * @member {Boolean} mobile - Current browser is mobile browser
     * @readonly
     */
    this.mobile = false;

    /**
     * @memberof uno.Browser
     * @member {Boolean} opera - Current browser is Opera
     * @readonly
     */
    this.opera = false;

    /**
     * @memberof uno.Browser
     * @member {Boolean} silk - Current browser is Amazon Silk
     * @readonly
     */
    this.silk = false;

    /**
     * @memberof uno.Browser
     * @member {Boolean} ie - Current browser is Internet Explorer
     * @readonly
     */
    this.ie = false;

    /**
     * @memberof uno.Browser
     * @member {Boolean} chrome - Current browser is Chrome
     * @readonly
     */
    this.chrome = false;

    /**
     * @memberof uno.Browser
     * @member {Boolean} safari - Current browser is Safari
     * @readonly
     */
    this.safari = false;

    /**
     * @memberof uno.Browser
     * @member {Boolean} android - Current browser is Android default browser
     * @readonly
     */
    this.android = false;

    /**
     * @memberof uno.Browser
     * @member {Boolean} firefox - Current browser is Firefox
     * @readonly
     */
    this.firefox = false;

    this._initialize();
};

/**
 * Initialize and check browser information
 * @private
 */
uno.Browser.prototype._initialize = function() {
    if (navigator && navigator.userAgent) {
        var ua = navigator.userAgent;
        var res;
        var regs = [
            {
                name: 'opera',
                exp: /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,   // Opera Mobile
                version: 3,
                mobile: true
            },
            {
                name: 'opera',
                exp: /\s(opr)\/((\d+)?[\w\.]+)/i,   // Opera Webkit
                version: 3,
                mobile: false
            },
            {
                name: 'opera',
                exp: /(opera).+version\/((\d+)?[\w\.]+)/i,  // Opera 11.6+
                version: 3,
                mobile: false
            },
            {
                name: 'silk',
                exp: /(silk)\/((\d+)?[\w\.]+)/i,
                version: 3,
                mobile: true
            },
            {
                name: 'ie',
                exp: /(iemobile)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i, // IE Mobile
                version: 3,
                mobile: true
            },
            {
                name: 'ie',
                exp: /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,
                version: 3,
                mobile: false
            },
            {
                name: 'ie',
                exp: /(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i, // IE11
                version: 3,
                mobile: false
            },
            {
                name: 'chrome',
                exp: /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+))/i,
                version: 3,
                mobile: false
            },
            {
                name: 'chrome',
                exp: /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i,
                version: 3,
                mobile: true
            },
            {
                name: 'android',
                exp: /(android).+version\/((\d+)?[\w\.]+)/i,
                version: 2,
                mobile: true
            },
            {
                name: 'safari',
                exp: /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i,
                version: 2,
                mobile: true
            },
            {
                name: 'safari',
                exp: /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i,
                version: 2,
                mobile: false
            },
            {
                name: 'firefox',
                exp: /(firefox)\/((\d+)?[\w\.-]+)/i,
                version: 3,
                mobile: false
            }
        ];
        this.any = true;
        for (var i = 0, l = regs.length; i < l; ++i) {
            var info = regs[i];
            res = info.exp.exec(ua);
            if (res) {
                this[info.name] = true;
                this.version = parseInt(res[info.version]);
                this.mobile = info.mobile;
                return;
            }
        }
    } else
        this.any = false;
};

uno.Browser = new uno.Browser();
/**
 * Device capabilities information
 * @namespace
 */
uno.Capabilities = function() {
    /**
     * @memberof uno.Capabilities
     * @member {Boolean} canvas - Has current environment Canvas rendering support
     * @readonly
     */
    this.canvas = false;

    /**
     * @memberof uno.Capabilities
     * @member {Boolean} webgl - Has current environment WebGL rendering support
     * @readonly
     */
    this.webgl = false;

    /**
     * @memberof uno.Capabilities
     * @member {Boolean} opengl - Has current environment OpenGL rendering support
     * @readonly
     */
    this.opengl = false;

    this._initialize();
};

/**
 * Check for Canvas rendering support
 * @private
 */
uno.Capabilities.prototype._checkCanvas = function() {
    try {
        var canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    } catch (e) {
        return false;
    }
};

/**
 * Check for WebGL rendering support
 * @private
 */
uno.Capabilities.prototype._checkWebgl = function() {
    try {
        var canvas = document.createElement('canvas');
        return !!window.WebGLRenderingContext && (!!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl'));
    } catch (e) {
        return false;
    }
};

/**
 * Initialize and check device capabilities information
 * @private
 */
uno.Capabilities.prototype._initialize = function() {
    if (window) {
        this.canvas = this._checkCanvas();
        this.webgl = this._checkWebgl();
    }
};

uno.Capabilities = new uno.Capabilities();
/**
 * Device information
 * @namespace
 */
uno.Device = function() {
    /**
     * @memberof uno.Device
     * @member {Boolean} iPhone - Device is iPhone
     * @readonly
     */
    this.iPhone = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} iPad - Device is iPad
     * @readonly
     */
    this.iPad = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} appleTV - Device is Apple TV
     * @readonly
     */
    this.appleTV = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} windowsPhone - Device is Windows Phone
     * @readonly
     */
    this.windowsPhone = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} blackberry - Device is BlackBerry
     * @readonly
     */
    this.blackberry = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} kindle - Device is Amazon Kindle
     * @readonly
     */
    this.kindle = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} firePhone - Device is Amazon Fire Phone
     * @readonly
     */
    this.firePhone = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} ouya - Device is Ouya
     * @readonly
     */
    this.ouya = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} nintendo - Device is Nintendo
     * @readonly
     */
    this.nintendo = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} playstation - Device is Sony Playstation
     * @readonly
     */
    this.playstation = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} xbox - Device is Microsoft Xbox
     * @readonly
     */
    this.xbox = false;

    this._initialize();
};

/**
 * Initialize and check device information
 * @private
 */
uno.Device.prototype._initialize = function() {
    if (navigator && navigator.userAgent) {
        var ua = navigator.userAgent.toLowerCase();
        var res;
        var regs = [
            {
                name: 'iPhone',
                exp: /\((iphone);.+(apple)/i,   // iPhone
                mobile: true
            },
            {
                name: 'iPad',
                exp: /\((ipad);.+(apple)/i,   // iPad
                mobile: true
            },
            {
                name: 'appleTV',
                exp: /(apple\s{0,1}tv)/i,   // Apple TV
                mobile: true
            },
            {
                name: 'windowsPhone',
                exp: /(windows\sphone)/i,   // Windows Phone
                mobile: true
            },
            {
                name: 'blackberry',
                exp: /(blackberry)[\s-]?(\w+)/i,   // BlackBerry
                mobile: true
            },
            {
                name: 'blackberry',
                exp: /\(bb10;\s(\w+)/i,   // BlackBerry
                mobile: true
            },
            {
                name: 'kindle',
                exp: /(kindle)\/([\w\.]+)/i,   // Amazon Kindle
                mobile: true
            },
            {
                name: 'kindle',
                exp: /(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i,   // Amazon Kindle Fire
                mobile: true
            },
            {
                name: 'firePhone',
                exp: /(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i,   // Amazon Fire Phone
                mobile: true
            },
            {
                name: 'ouya',
                exp: /\s(ouya)\s/i,   // Ouya
                mobile: false
            },
            {
                name: 'nintendo',
                exp: /(nintendo)\s([wids3u]+)/i,   // Nintendo
                mobile: true
            },
            {
                name: 'playstation',
                exp: /(playstation\s[3portablevi]+)/i,   // Sony Playstation
                mobile: false
            },
            {
                name: 'xbox',
                exp: /[\s\(;](xbox(?:\sone)?)[\s\);]/i,   // Microsoft Xbox
                mobile: false
            }
        ];
        for (var i = 0, l = regs.length; i < l; ++i) {
            var info = regs[i];
            res = info.exp.exec(ua);
            if (res) {
                this[info.name] = true;
                this.mobile = info.mobile;
                return;
            }
        }
    }
};

uno.Device = new uno.Device();
/**
 * Operation system information
 * @namespace
 */
uno.Os = function() {
    /**
     * @memberof uno.Os
     * @member {Boolean} mobile - Is current OS mobile
     * @readonly
     */
    this.mobile = false;

    /**
     * @memberof uno.Os
     * @member {Number} name - Name of the current OS
     * @readonly
     */
    this.name = '';

    /**
     * @memberof uno.Os
     * @member {Number} version - Version of the current OS
     * @readonly
     */
    this.version = '';

    /**
     * @memberof uno.Os
     * @member {Boolean} windows - Operation system is Windows
     * @readonly
     */
    this.windows = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} linux - Operation system is Linux
     * @readonly
     */
    this.linux = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} android - Operation system is Android
     * @readonly
     */
    this.android = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} macOS - Operation system is MacOS
     * @readonly
     */
    this.macOS = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} iOS - Operation system is iOS
     * @readonly
     */
    this.iOS = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} blackberry - Operation system is BlackBerry
     * @readonly
     */
    this.blackberry = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} tizen - Operation system is Tizen
     * @readonly
     */
    this.tizen = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} sailfishOS - Operation system is Sailfish OS
     * @readonly
     */
    this.sailfishOS = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} firefoxOS - Operation system is Firefox OS
     * @readonly
     */
    this.firefoxOS = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} chromiumOS - Operation system is Chromium OS
     * @readonly
     */
    this.chromiumOS = false;

    this._initialize();
};

/**
 * Initialize and check operation system information
 * @private
 */
uno.Os.prototype._initialize = function() {
    if (navigator && navigator.userAgent) {
        var ua = navigator.userAgent;
        var res;
        var regs = [
            {
                name: 'windows',
                exp: /microsoft\s(windows)\s(vista|xp)/i,   // Windows
                version: 2,
                mobile: false
            },
            {
                name: 'windows',
                exp: /(windows)\snt\s([\w\s\.]+);/i,   // Windows
                version: 2,
                mobile: false
            },
            {
                name: 'windows',
                exp: /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i,   // Windows Phone
                version: 2,
                mobile: true
            },
            {
                name: 'blackberry',
                exp: /\((bb)(10);/i,   // BlackBerry 10
                version: 2,
                mobile: true
            },
            {
                name: 'blackberry',
                exp: /(blackberry)\w*\/?([\w\.]+)*/i,   // BlackBerry
                version: 2,
                mobile: true
            },
            {
                name: 'tizen',
                exp: /(tizen)[\/\s]([\w\.]+)/i,   // Tizen
                version: 2,
                mobile: true
            },
            {
                name: 'android',
                exp: /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,   // Android
                version: 2,
                mobile: true
            },
            {
                name: 'sailfishOS',
                exp: /linux;.+(sailfish);/i,   // Sailfish OS
                version: 2,
                mobile: false
            },
            {
                name: 'firefoxOS',
                exp: /mozilla.+\(mobile;.+gecko.+firefox/i,   // Firefox OS
                version: 2,
                mobile: false
            },
            {
                name: 'chromiumOS',
                exp: /(cros)\s[\w]+\s([\w\.]+\w)/i,   // Chromium OS
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                exp: /(mint)[\/\s\(]?(\w+)*/i,   // Mint
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
                exp: /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                exp: /(hurd|linux)\s?([\w\.]+)*/i,   // Hurd/Linux
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                exp: /(gnu)\s?([\w\.]+)*/i,   // GNU
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                exp: /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i,   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
                version: 2,
                mobile: false
            },
            {
                name: 'iOS',
                exp: /(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i,   // iOS
                version: 2,
                mobile: true
            },
            {
                name: 'macOS',
                exp: /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,   // Mac OS
                version: 2,
                mobile: false
            },
            {
                name: 'macOS',
                exp: /(macintosh|mac(?=_powerpc)\s)/i,   // Mac OS
                version: false,
                mobile: false
            }
        ];
        for (var i = 0, l = regs.length; i < l; ++i) {
            var info = regs[i];
            res = info.exp.exec(ua);
            if (res) {
                this[info.name] = true;
                this.name = res[1];
                if (info.version !== false && res[info.version])
                    this.version = res[info.version].replace(/_/g, '.');
                this.mobile = info.mobile;
                return;
            }
        }
    }
};

uno.Os = new uno.Os();
/**
 * Device screen information
 * @namespace
 */
uno.Screen = function() {
    /**
     * @memberof uno.Screen
     * @member {Number} ratio - Screen pixel ratio
     * @readonly
     */
    this.ratio = 1;

    /**
     * @memberof uno.Screen
     * @member {Number} depth - Screen pixel depth
     * @readonly
     */
    this.depth = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} width - Total width of the screen
     * @readonly
     */
    this.width = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} height - Total height of the screen
     * @readonly
     */
    this.height = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} availWidth - The amount of horizontal space in pixels available to the render
     * @readonly
     */
    this.availWidth = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} availHeight - The amount of vertical space in pixels available to the render
     * @readonly
     */
    this.availHeight = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} scrollX - Horizontal scroll
     * @readonly
     */
    this.scrollX = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} scrollY - Vertical scroll
     * @readonly
     */
    this.scrollY = 0;

    this._initialize();
};

/**
 * Initialize and check device screen information
 * @private
 */
uno.Screen.prototype._initialize = function() {
    var self = this;
    if (window) {
        this.ratio = window.devicePixelRatio || 1;
        if (window.screen) {
            this.width = window.screen.width;
            this.height = window.screen.height;
            this.depth = window.screen.pixelDepth;
        }
        if (document) {
            var resize = function() {
                self.availWidth = document.documentElement.clientWidth;
                self.availHeight = document.documentElement.clientHeight;
                // TODO: Hack, need to investigate
                if (uno.Browser.chrome || uno.Browser.safari || uno.Browser.opera)
                    self.availHeight -= 4;
            };
            var scroll = function() {
                self.scrollX = window.pageXOffset;
                self.scrollY = window.pageYOffset;
            };
            window.addEventListener('resize', resize, true);
            window.addEventListener('scroll', scroll, true);
            resize();
            scroll();
        }
    }
};

uno.Screen = new uno.Screen();
/**
 * uno.Color class holds color data
 * @param {Number|uno.Color} [r=1] - The red value of the color.<br>
 *     If g is undefined then r treated as color hex value (if r is Number) or uno.Color to copy
 * @param {Number} [g=1] - The green value of the color
 * @param {Number} [b=1] - The blue value of the color
 * @param {Number} [a=1] - The alpha value of the color
 * @constructor
 */
uno.Color = function(r, g, b, a) {
    /**
     * The red value of the color
     * @type {Number}
     * @private
     */
    this._r = 1;

    /**
     * The green value of the color
     * @type {Number}
     * @private
     */
    this._g = 1;

    /**
     * The blue value of the color
     * @type {Number}
     * @private
     */
    this._b = 1;

    /**
     * The alpha value of the color
     * @type {Number}
     * @private
     */
    this._a = 1;

    /**
     * Is cached values is dirty
     * @type {Boolean}
     * @private
     */
    this._dirty = true;

    /**
     * Cached hex value
     * @type {Number}
     * @private
     */
    this._hex = 0;

    /**
     * Cached CSS hex value
     * @type {String}
     * @private
     */
    this._cssHex = '';

    /**
     * Cached CSS RGBA value
     * @type {string}
     * @private
     */
    this._cssRGBA = '';

    /**
     * Cached packed ABGR value (one unsigned int with alpha, blue, green and red values in bytes)
     * @type {number}
     * @private
     */
    this._packedABGR = 0;

    this.set(r, g, b, a);
};

/**
 * Set color properties
 * @param {Number|uno.Color} [r=1] - The red value of the color.<br>
 *     If g is undefined then r treated as color hex value (if r is Number) or uno.Color to copy
 * @param {Number} [g=1] - The green value of the color
 * @param {Number} [b=1] - The blue value of the color
 * @param {Number} [a=1] - The alpha value of the color
 * @returns {uno.Color} - <code>this</code>
 */
uno.Color.prototype.set = function(r, g, b, a) {
    if (r !== undefined && g === undefined) {
        if (r.r !== undefined) {
            this._r = r.r;
            this._g = r.g;
            this._b = r.b;
            this._a = r.a;
            this._dirty = true;
            return this;
        }
        this.hex = r;
        this._dirty = true;
        return this;
    }
    this.r = r === undefined ? 1 : r;
    this.g = g === undefined ? 1 : g;
    this.b = b === undefined ? 1 : b;
    this.a = a === undefined ? 1 : a;
    this._dirty = true;
    return this;
};

/**
 * Is the color equal to given
 * @param {Number|uno.Color} r - The red value of the color.<br>
 *     If g is undefined then r treated as color hex value (if r is Number) or uno.Color
 * @param {Number} g - The green value of the color
 * @param {Number} b - The blue value of the color
 * @param {Number} a - The alpha value of the color
 * @returns {Boolean}
 */
uno.Color.prototype.equal = function(r, g, b, a) {
    if (g === undefined) {
        if (r.r !== undefined)
            return this._r === r.r && this._g === r.g && this._b === r.b && this._a === r.a;
        return this.hex === r;
    }
    return this._r === r && this._g === g && this._b === b && this._a === a;
};

/**
 * Clone the color and return copied instance
 * @returns {uno.Color} - The color copy
 */
uno.Color.prototype.clone = function() {
    return new uno.Color(this);
};

/**
 * Quantize color values
 * @param {Number} count - The values count to quantize
 * @returns {uno.Color} - <code>this</code>
 */
uno.Color.prototype.quantize = function(count) {
    this._r = Math.round(this._r * count) / count;
    this._g = Math.round(this._g * count) / count;
    this._b = Math.round(this._b * count) / count;
    this._dirty = true;
    return this;
};

/**
 * The R value of the color
 * @name uno.Color#r
 * @type {Number}
 * @default 1
 */
Object.defineProperty(uno.Color.prototype, 'r', {
    get: function() {
        return this._r;
    },
    set: function(value) {
        if (value === undefined || this._r === value)
            return;
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        this._r = value;
        this._dirty = true;
    }
});

/**
 * The G value of the color
 * @name uno.Color#g
 * @type {Number}
 * @default 1
 */
Object.defineProperty(uno.Color.prototype, 'g', {
    get: function() {
        return this._g;
    },
    set: function(value) {
        if (value === undefined || this._g === value)
            return;
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        this._g = value;
        this._dirty = true;
    }
});

/**
 * The B value of the color
 * @name uno.Color#b
 * @type {Number}
 * @default 1
 */
Object.defineProperty(uno.Color.prototype, 'b', {
    get: function() {
        return this._b;
    },
    set: function(value) {
        if (value === undefined || this._b === value)
            return;
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        this._b = value;
        this._dirty = true;
    }
});

/**
 * The A value of the color
 * @name uno.Color#a
 * @type {Number}
 * @default 1
 */
Object.defineProperty(uno.Color.prototype, 'a', {
    get: function() {
        return this._a;
    },
    set: function(value) {
        if (value === undefined || this._a === value)
            return;
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        this._a = value;
        this._dirty = true;
    }
});

/**
 * The hex representation of the color
 * @name uno.Color#hex
 * @type {Number}
 * @default 0xFFFFFF
 */
Object.defineProperty(uno.Color.prototype, 'hex', {
    get: function() {
        if (this._dirty)
            this._hex = (this._r * 255 << 16) + (this._g * 255 << 8) + this._b * 255;
        return this._hex;
    },
    set: function(value) {
        this.r = (value >> 16 & 0xFF) / 255;
        this.g = (value >> 8 & 0xFF) / 255;
        this.b = (value & 0xFF) / 255;
        this.a = 1;
        this._dirty = true;
    }
});

/**
 * The CSS hex representation of the color<br>
 *     Example: #AABBCC
 * @name uno.Color#cssHex
 * @type {String}
 * @default #FFFFFF
 */
Object.defineProperty(uno.Color.prototype, 'cssHex', {
    get: function() {
        if (this._dirty)
            this._cssHex = '#' + ('00000' + (this.hex | 0).toString(16)).substr(-6);
        return this._cssHex;
    },
    set: function(value) {
        this.hex = parseInt(value.substr(1), 16);
    }
});

/**
 * The CSS RGBA representation of the color<br>
 *     Example: rgba(128, 128, 128, 0.5)
 * @name uno.Color#cssRGBA
 * @type {String}
 * @default rgba(1, 1, 1, 1)
 * @readonly
 */
Object.defineProperty(uno.Color.prototype, 'cssRGBA', {
    get: function() {
        if (this._dirty) {
            this._cssRGBA = 'rgba(' + Math.floor(this._r * 255) + ',' + Math.floor(this._g * 255) +
            ',' + Math.floor(this._b * 255) + ',' + this._a + ')';
        }
        return this._cssRGBA;
    }
});

/**
 * The packed to unsigned int ABGR representation of the color
 * @name uno.Color#packedABGR
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.Color.prototype, 'packedABGR', {
    get: function() {
        if (this._dirty)
            this._packedABGR = (this._a * 255 << 24) | (this._b * 255 << 16) | (this._g * 255 << 8) | (this._r * 255);
        return this._packedABGR;
    }
});

/**
 * Transparent color
 * @const
 * @type {uno.Color}
 */
uno.Color.TRANSPARENT    = new uno.Color(0, 0, 0, 0);

/**
 * White color
 * @const
 * @type {uno.Color}
 */
uno.Color.WHITE          = new uno.Color(1, 1, 1);

/**
 * Black color
 * @const
 * @type {uno.Color}
 */
uno.Color.BLACK          = new uno.Color(0, 0, 0);

/**
 * Red color
 * @const
 * @type {uno.Color}
 */
uno.Color.RED            = new uno.Color(1, 0, 0);

/**
 * Green color
 * @const
 * @type {uno.Color}
 */
uno.Color.GREEN          = new uno.Color(0, 1, 0);

/**
 * Blue color
 * @const
 * @type {uno.Color}
 */
uno.Color.BLUE           = new uno.Color(0, 0, 1);
/**
 * Texture stores the information that represents an image
 * @constructor
 */
uno.Texture = function(width, height) {
    /**
     * The texture unique id
     * @type {Number}
     * @readonly
     */
    this.id = uno.Texture._uid++;

    /**
     * The texture scale mode<br>
     *     See {@link uno.Render} constants
     * @type {Number}
     * @default uno.Render.SCALE_DEFAULT
     */
    this.scaleMode = uno.Render.SCALE_DEFAULT;

    /**
     * Width of the texture
     * @type {Number}
     * @private
     */
    this._width = 0;

    /**
     * Height of the texture
     * @type {Number}
     * @private
     */
    this._height = 0;

    /**
     * Is texture loaded
     * @type {Boolean}
     * @private
     */
    this._ready = false;

    /**
     * URL if texture is loaded
     * @type {Boolean}
     * @private
     */
    this._url = null;

    /**
     * The texture extensions for renders
     * @type {Number}
     * @private
     */
    this._extensions = {};

    if (!width || !height)
        return;

    if (uno.Browser.any) {
        this._width = width;
        this._height = height;
        this._pot = uno.Math.isPOT(width) && uno.Math.isPOT(height);
        this._ready = true;
        return;
    }

    uno.error('Only browsers currently supported');
};

/**
 * Texture global counter
 * @type {Number}
 * @private
 */
uno.Texture._uid = 0;

/**
 * Load texture from URL
 * @param {String} url - The image URL
 * @param {Function} complete - Function to call after loading
 * @param {Boolean} [cache=true] - Should the texture cached
 * @returns {uno.Texture} - <code>this</code>
 */
uno.Texture.prototype.load = function(url, complete, cache) {
    this.destroy();

    // TODO: This block is platform specific. Should we do anything with it?
    if (uno.Browser.any) {
        uno.CanvasTexture.get(this).load(url, this._onLoad.bind(this, complete), cache);
        return this;
    }

    uno.error('Only browsers currently supported');
};

/**
 * Destroy texture data
 */
uno.Texture.prototype.destroy = function() {
    for (var i in this._extensions)
        this._extensions[i].destroy();
    this.scaleMode = uno.Render.SCALE_DEFAULT;
    this._pot = false;
    this._ready = false;
    this._url = null;
    this._extensions = {};
};

/**
 * The width of the texture
 * @name uno.Texture#width
 * @type {Number}
 * @default 0
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'width', {
    get: function() {
        return this._width;
    }
});

/**
 * The height of the texture
 * @name uno.Texture#height
 * @type {Number}
 * @default 0
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'height', {
    get: function() {
        return this._height;
    }
});

/**
 * Is the texture ready for use (loaded or created)
 * @name uno.Texture#ready
 * @type {Boolean}
 * @default false
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'ready', {
    get: function() {
        return this._ready;
    }
});

/**
 * If texture loaded URL returned else null
 * @name uno.Texture#url
 * @type {String}
 * @default false
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'url', {
    get: function() {
        return this._url;
    }
});

/**
 * Is the texture width and height power of two
 * @name uno.Texture#pot
 * @type {Boolean}
 * @default false
 * @readonly
 */
Object.defineProperty(uno.Texture.prototype, 'pot', {
    get: function() {
        return this._pot;
    }
});

/**
 * Process loaded texture
 * @param {Function} complete - Function to call after loading
 * @param {Object} success - True if loading success
 * @param {String} url - URL of the texture
 * @param {Number} width - Width of the loaded texture
 * @param {Number} height - Height of the loaded texture
 * @private
 */
uno.Texture.prototype._onLoad = function(complete, url, success, width, height) {
    if (!success)
        return uno.error('Can\'t load image', '[', url, ']');
    this._width = width;
    this._height = height;
    this._pot = uno.Math.isPOT(width) && uno.Math.isPOT(height);
    this._url = url;
    this._ready = true;
    if (complete)
        complete(this);
};

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
/**
 * Render creation module
 * @namespace
 */
uno.Render = {

    /**
     * @memberof uno.Render
     * @member {Number} RENDER_CANVAS - Canvas mode rendering
     */
    RENDER_CANVAS: 1,

    /**
     * @memberof uno.Render
     * @member {Number} RENDER_WEBGL - WebGL mode rendering
     */
    RENDER_WEBGL: 2,

    /**
     * @memberof uno.Render
     * @member {Number} SCALE_DEFAULT - Default texture scaling mode
     */
    SCALE_DEFAULT: 0,

    /**
     * @memberof uno.Render
     * @member {Number} SCALE_LINEAR - Smooth texture scaling mode
     */
    SCALE_LINEAR: 0,

    /**
     * @memberof uno.Render
     * @member {Number} SCALE_NEAREST - Pixelating texture scaling mode
     */
    SCALE_NEAREST: 1,

    /**
     * @memberof uno.Render
     * @member {Number} BLEND_NONE - Normal blend mode with optimization for opaque textures in GL mode
     */
    BLEND_NONE: 0,

    /**
     * @memberof uno.Render
     * @member {Number} BLEND_NORMAL - This is the standard blend mode which uses the top layer alone, without mixing its colors with the layer beneath it
     */
    BLEND_NORMAL: 1,

    /**
     * @memberof uno.Render
     * @member {Number} BLEND_ADD - This blend mode simply adds pixel values of one layer with the other
     */
    BLEND_ADD: 2,

    /**
     * @memberof uno.Render
     * @member {Number} BLEND_MULTIPLY - This blend mode multiplies the numbers for each pixel of the top layer with the corresponding pixel for the bottom layer
     */
    BLEND_MULTIPLY: 3,

    /**
     * @memberof uno.Render
     * @member {Number} BLEND_SCREEN - This blend mode inverts both layers, multiplies them, and then inverts that result
     */
    BLEND_SCREEN: 4,

    /**
     * @memberof uno.Render
     * @member {Object} DEFAULT_SETTINGS - Default rates for render creation
     * @property {Boolean} antialias - Enable antialiasing while rendering
     * @property {Boolean} transparent - Enable transparent background in browser mode
     * @property {Boolean} autoClear - Enable clearing viewport every frame
     * @property {uno.Color} clearColor - Color for clearing viewport
     * @property {Number} width - Width of render viewport (0 - fullscreen)
     * @property {Number} height - Height of render viewport (0 - fullscreen)
     * @property {Number} fps - Maximum frame per second (0 - stop rendering)
     * @property {Number} ups - Maximum updates per second (0 - stop updating)
     * @property {Object} canvas - For browser mode canvas element for render
     * @property {Boolean} contextMenu - For browser mode disable or enable right click context menu
     */
    DEFAULT_SETTINGS: {
        antialias: true,
        transparent: false,
        autoClear: true,
        clearColor: uno.Color.WHITE.clone(),
        width: 0,
        height: 0,
        fps: 60,
        ups: 60,
        canvas: null,
        contextMenu: false
    },

    /**
     * @memberof uno.Render
     * @member {Object} DEFAULT_GRAPHICS - Default settings for rendering graphics
     * @property {uno.Color} fillColor - Default fill color
     * @property {uno.Color} lineColor - Default line color
     * @property {Number} lineWidth - Default line width
     */
    DEFAULT_GRAPHICS: {
        fillColor: uno.Color.WHITE.clone(),
        lineColor: uno.Color.BLACK.clone(),
        lineWidth: 1
    },

    /**
     * @memberof uno.Render
     * @member {Object} renders - List of all created renders
     */
    renders: {},

    /**
     * @memberof uno.Render
     * @member {Number} _uid - Counter for render unique id
     * @private
     */
    _uid: 0
};

/**
 * Create new render with settings
 * @param {Object} settings - Settings for the new render<br>
 *     See uno.Render.DEFAULT_SETTINGS<br>
 *     Also settings extended with:<br>
 *     settings.container - HTML element to add new canvas to it if settings.canvas is null<br>
 *     settings.containerId - ID for HTML element to add new canvas to it if settings.canvas is null<br>
 * @returns {uno.CanvasRender|uno.WebglRender}
 */
uno.Render.create = function(settings) {
    settings = settings || {};
    var setts = {};
    var mode = settings.mode || false;
    if (uno.Browser.any) {
        var def = uno.Render.DEFAULT_SETTINGS;
        setts.antialias = settings.antialias || def.antialias;
        setts.transparent = settings.transparent || def.transparent;
        setts.autoClear = settings.autoClear || def.autoClear;
        setts.clearColor = settings.clearColor || def.clearColor.clone();
        setts.width = settings.width || (def.width || uno.Screen.availWidth);
        setts.height = settings.height || (def.height || uno.Screen.availHeight);
        setts.fps = settings.fps === 0 ? 0 : (settings.fps || def.fps);
        setts.ups = settings.ups === 0 ? 0 : (settings.ups || def.ups);
        setts.contextMenu = settings.contextMenu || def.contextMenu;
        if (!settings.canvas) {
            var canvas = document.createElement('canvas');
            if (settings.containerId)
                document.getElementById(settings.containerId).appendChild(canvas);
            else if (settings.container)
                settings.container.appendChild(canvas);
            else
                document.body.appendChild(canvas);
            setts.canvas = canvas;
        } else
            setts.canvas = settings.canvas;
        if (!mode) {
            if (uno.Capabilities.webgl)
                return new uno.WebglRender(setts);
            return new uno.CanvasRender(setts);
        }
        if (mode === uno.Render.RENDER_WEBGL)
            return new uno.WebglRender(setts);
        return new uno.CanvasRender(setts);
    }
    return uno.error('Only browsers currently supported');
};
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
    var blendMode = render._currentBlendMode;
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    for (i = 0; i < l; ++i) {
        item = items[i];
        figure = item.shape;
        if (worldEmpty || !item.matrix)
            render.transform(item.matrix ? item.matrix : world);
        else {
            uno.Matrix.concat(item.matrix, world, temp);
            render.transform(temp);
        }
        this.lineColor(item.lineColor);
        this.lineWidth(item.lineWidth);
        render.fillColor(item.fillColor);
        render.blendMode(item.blendMode);
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
    render.blendMode(blendMode);
    render.transform(world);
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
/**
 * Canvas texture extension
 * @param {uno.Texture} texture - Texture that holds this extension
 * @constructor
 */
uno.CanvasTexture = function(texture) {
    /**
     * Parent texture for this extension
     * @type {uno.Texture}
     * @private
     */
    this.texture = texture;

    /**
     * Image or canvas with texture data
     * @type {Image|canvas}
     * @private
     */
    this._source = null;

    /**
     * Texture context for manipulation
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._context = null;

    /**
     * Cache for texture tinting
     * @type {Object}
     * @private
     */
    this._tintCache = {};

    /**
     * Image data for methods getPixels/setPixels
     * @type {ImageData}
     * @private
     */
    this._imageData = null;
};

/**
 * Free all allocated resources and destroy texture extension
 */
uno.CanvasTexture.prototype.destroy = function() {
    uno.CanvasTinter.removeCache(this);
    this.texture = null;
    this._source = null;
    this._context = null;
    this._tintCache = null;
};

/**
 * Tint texture using {@link uno.CanvasTinter}
 * @param {uno.Color} tint - Tint color
 * @returns {canvas}
 */
uno.CanvasTexture.prototype.tint = function(tint) {
    return uno.CanvasTinter.tint(this, tint);
};

/**
 * Return 2d context of the texture for render target<br>
 *     This function called very frequently, try avoid variable creation
 * @returns {CanvasRenderingContext2D}
 */
uno.CanvasTexture.prototype.context = function() {
    if (!this._context)
        this._context = this._source.getContext('2d');
    return this._context;
};

/**
 * Get texture handle for render<br>
 *     This function called very frequently, try avoid variable creation
 * @returns {Image|canvas} - Texture canvas
 */
uno.CanvasTexture.prototype.handle = function() {
    if (this._source === null && this.texture.width && this.texture.height) {
        var source = document.createElement('canvas');
        source.width = this.texture.width;
        source.height = this.texture.height;
        this._source = source;
    }
    return this._source;
};

/**
 * Get or set texture pixels
 * @returns {Uint8ClampedArray}
 */
uno.CanvasTexture.prototype.getPixels = function() {
    this._imageData = this.context().getImageData(0, 0, this.texture.width, this.texture.height);
    return this._imageData.data;
};

/**
 * Get or set texture pixels
 * @param {Uint8ClampedArray} data - Pixels data
 * @returns {CanvasTexture} - <code>this</code>
 */
uno.CanvasTexture.prototype.setPixels = function(data) {
    if (this._imageData.data !== data)
        this._imageData.set(data);
    this.context().putImageData(this._imageData, 0, 0);
    return this;
};

/**
 * Load texture
 * @param {String} url - URL of the image
 * @param {Function} complete - Call function after load
 * @param {Boolean} [cache=true] - Should the texture cached
 */
uno.CanvasTexture.prototype.load = function(url, complete, cache) {
    if (uno.CanvasTexture._cache[url]) {
        this._source = uno.CanvasTexture._cache[url];
        complete(url, true, this._source.width, this._source.height);
        return;
    }
    var source = new Image();
    var self = this;
    source.addEventListener('load', function() {
        if (cache !== false)
            uno.CanvasTexture._cache[url] = cache;
        self._source = source;
        complete(url, true, source.width, source.height);
    });
    source.addEventListener('error', function() {
        complete(url, false);
    });
    source.src = url;
    return source;
};

/**
 * Get texture extension factory<br>
 *     This function called very frequently, try avoid variable creation
 * @param {uno.Texture} texture
 * @returns {uno.CanvasTexture}
 */
uno.CanvasTexture.get = function(texture) {
    if (!texture._extensions.canvas)
        texture._extensions.canvas = new uno.CanvasTexture(texture);
    return texture._extensions.canvas;
};

/**
 * Texture data global cache by URL
 * @type {Object}
 * @private
 */
uno.CanvasTexture._cache = {};
/**
 * Canvas tint helper
 * @constructor
 */
uno.CanvasTinter = function() {
};

/**
 * Do cache clearing or not
 * @type {Boolean}
 * @default true
 */
uno.CanvasTinter.CACHE_CLEAR = true;

/**
 * Quantize color to this number to caching textures for color
 * @type {Number}
 * @default 32
 */
uno.CanvasTinter.CACHE_COUNT = 32;

/**
 * If {@link uno.CanvasTinter.CACHE_CLEAR} is true, check for clearing timeout in seconds
 * @type {Number}
 * @default 5
 */
uno.CanvasTinter.CACHE_CHECK_TIMEOUT = 5;

/**
 * If {@link uno.CanvasTinter.CACHE_CLEAR} is true, life time for tinted texture in seconds
 * @type {Number}
 * @default 30
 */
uno.CanvasTinter.CACHE_TTL = 30;

/**
 * Timer for cache cleaning
 * @type {Number}
 * @private
 */
uno.CanvasTinter._cacheTimer = 0;

/**
 * Cached textures
 * @type {Array}
 * @private
 */
uno.CanvasTinter._cacheTextures = [];

/**
 * Tint texture in canvas mode that not supported it native
 * @param {uno.CanvasTexture} canvasTexture - Source texture
 * @param {uno.Color} color - Tint color
 * @returns {canvas} - Result tinted texture
 */
uno.CanvasTinter.tint = function(canvasTexture, color) {
    if (color.equal(uno.Color.WHITE))
        return canvasTexture.texture._source;
    if (uno.CanvasTinter.multiplyMode === undefined)
        uno.CanvasTinter.multiplyMode = uno.CanvasRender._blendModesSupported();
    if (!uno.CanvasTinter._color)
        uno.CanvasTinter._color = color.clone();
    else
        uno.CanvasTinter._color.set(color);
    var tint = uno.CanvasTinter._color;
    tint.quantize(uno.CanvasTinter.CACHE_COUNT);
    var cache = canvasTexture._tintCache[tint.hex];
    if (cache)
        return cache.canvas;
    var image = canvasTexture._source;
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    if (uno.CanvasTinter.multiplyMode)
        uno.CanvasTinter._tintMultiply(canvas.getContext('2d'), image, tint);
    else
        uno.CanvasTinter._tintPixel(canvas.getContext('2d'), image, tint);
    canvasTexture._tintCache[tint.hex] = { canvas: canvas, stamp: uno.time() };
    if (uno.CanvasTinter.CACHE_CLEAR) {
        if (uno.CanvasTinter._cacheTextures.indexOf(canvasTexture) === -1)
            uno.CanvasTinter._cacheTextures.push(canvasTexture);
        if (!uno.CanvasTinter._cacheTimer)
            uno.CanvasTinter._cacheTimer = setInterval(uno.CanvasTinter._checkCache, uno.CanvasTinter.CACHE_CHECK_TIMEOUT * 1000);
    }
    return canvas;
};

/**
 * Clear cache for texture
 * @param {canvas|Image} canvasTexture - Clear cache for this texture
 */
uno.CanvasTinter.removeCache = function(canvasTexture) {
    for (var i in canvasTexture._tintCache)
        canvasTexture._tintCache[i].canvas = null;
    canvasTexture._tintCache = {};
    var index = uno.CanvasTinter._cacheTextures.indexOf(canvasTexture);
    if (index === -1)
        uno.CanvasTinter._cacheTextures.splice(index, 1);
};

/**
 * Check cache for deleting
 * @private
 */
uno.CanvasTinter._checkCache = function() {
    var stamp = uno.time();
    var ttl = uno.CanvasTinter.CACHE_TTL * 1000;
    var cache, i, j, l, count;
    for (i = 0, l = uno.CanvasTinter._cacheTextures.length; i < l; ++i) {
        cache = uno.CanvasTinter._cacheTextures[i]._tintCache;
        count = 0;
        for (j in cache) {
            if (stamp - cache[j].stamp >= ttl)
                delete cache[j];
            else
                ++count;
        }
        if (!count) {
            uno.CanvasTinter._cacheTextures.splice(i, 1);
            --i;
            --l;
        }
    }
};

/**
 * Tint texture using multiply blend mode
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {canvas} image - Source image
 * @param {uno.Color} color - Tint color
 * @private
 */
uno.CanvasTinter._tintMultiply = function(ctx, image, color) {
    ctx.fillStyle = color.cssHex;
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    ctx.globalCompositeOperation = 'destination-atop';
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
};

/**
 * Tint texture using per pixel method (slow)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {canvas} image - Source image
 * @param {uno.Color} color - Tint color
 * @private
 */
uno.CanvasTinter._tintPixel = function(ctx, image, color) {
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    var r = color.r;
    var g = color.g;
    var b = color.b;
    var data = ctx.getImageData(0, 0, image.width, image.height);
    var pixels = data.data;
    for (var i = 0, l = pixels.length; i < l; i += 4) {
        pixels[i] *= r;
        pixels[i + 1] *= g;
        pixels[i + 2] *= b;
    }
    ctx.putImageData(data, 0, 0);
};
/**
 * Canvas render
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
 * @constructor
 */
uno.CanvasRender = function(settings) {
    /**
     * Type of render. See {@link uno.Render} constants
     * @type {Number}
     * @default uno.Render.RENDER_CANVAS
     */
    this.type = uno.Render.RENDER_CANVAS;

    /**
     * Root scene object
     * @type {uno.Object}
     */
    this.root = null;

    this._setupSettings(settings);
    this._setupProps();
    this._setupBounds();
    if (!this._createContext())
        return;
    this._setupViewport(settings);
    this._setupManagers();
    this._resetState();
    this._registerRender();
    this._setupFrame();
};

/**
 * Resize viewport
 * @param {Number} width - New width of the viewport
 * @param {Number} height - New width of the viewport
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;
    this._canvas.width = width;
    this._canvas.height = height;
    this._updateBounds();
    return this;
};

/**
 * Free all allocated resources and destroy render
 */
uno.CanvasRender.prototype.destroy = function() {
    delete uno.Render.renders[this.id];
    this._context = null;
    this._canvas = null;
    this._target = null;
    this._displayCanvas = null;
    this._displayContext = null;
    this._currentMatrix = null;
    this._clearMatrixTemp = null;
    this._clearColorTemp = null;
    this._bounds = null;
    this._boundsScroll = null;
    this._frameBind = null;
    this._graphics.destroy();
    this._graphics = null;
    this.root = null;
};

/**
 * Get bounds of render
 * For browser bounds is position and size on page
 * For other platforms position and size on screen
 * @returns {uno.Rect}
 */
uno.CanvasRender.prototype.bounds = function() {
    if (!this._boundsScroll.equal(uno.Screen.scrollX, uno.Screen.scrollY))
        this._updateBounds();
    return this._bounds;
};

/**
 * Set or reset render target texture
 * @param {uno.CanvasTexture} texture - Texture for render buffer
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.target = function(texture) {
    if (!texture) {
        this._target = null;
        this._canvas = this._displayCanvas;
        this._context = this._displayContext;
        return this;
    }

    this._target = texture;
    var extension = uno.CanvasTexture.get(texture);
    this._canvas = extension.handle(this);
    this._context = extension.context();

    return this;
};

/**
 * Set current transform
 * @param {uno.Matrix} [matrix] - The new matrix transform
 * @returns {uno.Matrix} - Current matrix transform
 */
uno.CanvasRender.prototype.transform = function(matrix) {
    if (!matrix)
        return this._currentMatrix;
    if (this._hasResetTransform && matrix.identity())
        this._context.resetTransform();
    else
        this._context.setTransform(matrix.a, matrix.c, matrix.b, matrix.d, matrix.tx, matrix.ty);
    return this._currentMatrix.set(matrix);
};

/**
 * Set current blend mode
 * @param {Number} [mode] - The new blend mode. See {@link uno.Render} constants
 * @returns {Number} - Current blend mode
 */
uno.CanvasRender.prototype.blendMode = function(mode) {
    if (mode === undefined || this._currentBlendMode === mode || !uno.CanvasRender._blendModes)
        return this._currentBlendMode;
    if (!uno.CanvasRender._blendModes[mode])
        return this._currentBlendMode;
    this._context.globalCompositeOperation = uno.CanvasRender._blendModes[mode];
    return this._currentBlendMode = mode;
};

/**
 * Set current fill color for rendering graphics shapes
 * @param {uno.Color} [color] - The new fill color
 * @returns {uno.Color} - Current fill color
 */
uno.CanvasRender.prototype.fillColor = function(color) {
    return this._graphics.fillColor(color);
};

/**
 * Set current line color for rendering graphics shapes
 * @param {uno.Color} [color] - The new line color
 * @returns {uno.Color} - Current line color
 */
uno.CanvasRender.prototype.lineColor = function(color) {
    return this._graphics.lineColor(color);
};

/**
 * Set current line width for rendering graphics shapes
 * @param {Number} [width] - The new line width
 * @returns {Number} - Current line width
 */
uno.CanvasRender.prototype.lineWidth = function(width) {
    return this._graphics.lineWidth(width);
};

/**
 * Clear viewport with color
 * @param {uno.Color} [color] - Color to fill viewport. If undefined {@link uno.WebglRender.clearColor} used
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.clear = function(color) {
    var ctx = this._context;
    this.blendMode(uno.Render.BLEND_NORMAL);

    this._clearMatrixTemp.set(this._currentMatrix);
    this.transform(uno.Matrix.IDENTITY);

    if (this._transparent) {
        if (!color && this.clearColor === false)
            return this;
        ctx.clearRect(0, 0, this.width, this.height);
        return this;
    }

    if (!color)
        color = this.clearColor;

    if (!color || !color.a)
        return this;

    var graphics = this._graphics;
    var width = graphics.lineWidth();
    var fill = this._clearColorTemp.set(graphics.fillColor());
    graphics.fillColor(color);
    graphics.lineWidth(0);
    graphics.drawRect(0, 0, this.width, this.height);
    graphics.fillColor(fill);
    graphics.lineWidth(width);

    this.transform(this._clearMatrixTemp);

    return this;
};

/**
 * Draw texture
 * @param {uno.Texture} texture - The texture to render
 * @param {uno.Rect} frame - The frame to render rect of the texture
 * @param {Number} [alpha=1] - Texture opacity
 * @param {uno.Color} [tint=uno.Color.WHITE] - The texture tint color
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawTexture = function(texture, frame, alpha, tint) {
    if (!texture.ready)
        return this;
    var ctx = this._context;
    this._setScaleMode(texture.scaleMode);
    this._setAlpha(alpha || 1);
    ctx.drawImage(
        (!tint || tint.equal(uno.Color.WHITE)) ? uno.CanvasTexture.get(texture).handle() : uno.CanvasTexture.get(texture).tint(tint),
        frame ? frame.x : 0, frame ? frame.y : 0, frame ? frame.width : texture.width, frame ? frame.height : texture.height,
        0, 0, frame ? frame.width : texture.width, frame ? frame.height : texture.height);
    return this;
};

/**
 * Draw line
 * @param {Number} x1 - The x-coordinate of the first point of the line
 * @param {Number} y1 - The y-coordinate of the first point of the line
 * @param {Number} x2 - The x-coordinate of the second point of the line
 * @param {Number} y2 - The y-coordinate of the second point of the line
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawLine = function(x1, y1, x2, y2) {
    this._setAlpha(1);
    this._graphics.drawLine(x1, y1, x2, y2);
    return this;
};

/**
 * Draw rectangle
 * @param {Number} x - The x-coordinate of the left-top point of the rect
 * @param {Number} y - The y-coordinate of the left-top point of the rect
 * @param {Number} width - The rectangle width
 * @param {Number} height - The rectangle height
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawRect = function(x, y, width, height) {
    this._setAlpha(1);
    this._graphics.drawRect(x, y, width, height);
    return this;
};

/**
 * Draw circle
 * @param {Number} x - The x-coordinate of the center of the circle
 * @param {Number} y - The y-coordinate of the center of the circle
 * @param {Number} radius - The radius of the circle
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawCircle = function(x, y, radius) {
    this._setAlpha(1);
    this._graphics.drawCircle(x, y, radius);
    return this;
};

/**
 * Draw ellipse
 * @param {Number} x - The x-coordinate of the center of the ellipse
 * @param {Number} y - The y-coordinate of the center of the ellipse
 * @param {Number} width - The width of the ellipse
 * @param {Number} height - The width of the ellipse
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawEllipse = function(x, y, width, height) {
    this._setAlpha(1);
    this._graphics.drawEllipse(x, y, width, height);
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
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawArc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    this._setAlpha(1);
    this._graphics.drawArc(x, y, radius, startAngle, endAngle, antiClockwise);
    return this;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawPoly = function(points) {
    this._setAlpha(1);
    this._graphics.drawPoly(points);
    return this;
};

/**
 * Draw previously created shape
 * @param {uno.Shape} shape - The shape created before
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.drawShape = function(shape) {
    this._graphics.drawShape(shape);
    return this;
};

/**
 * Start creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.CanvasRender.prototype.startShape = function() {
    return this._graphics.startShape();
};

/**
 * Finish creating shape
 * @returns {uno.Shape} - Created shape
 */
uno.CanvasRender.prototype.endShape = function() {
    return this._graphics.endShape();
};

/**
 * Get texture pixels
 * @param {uno.Texture} texture - The texture to process
 * @returns {Uint8Array}
 */
uno.CanvasRender.prototype.getPixels = function(texture) {
    return uno.CanvasTexture.get(texture).getPixels();
};

/**
 * Set texture pixels
 * @param {uno.Texture} texture - The texture to process
 * @param {Uint8Array} data - Pixels data
 * @returns {uno.CanvasRender} - <code>this</code>
 */
uno.CanvasRender.prototype.setPixels = function(texture, data) {
    uno.CanvasTexture.get(texture).setPixels(data);
    return this;
};

/**
 * Initialize settings properties helper
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
 * @private
 */
uno.CanvasRender.prototype._setupSettings = function(settings) {
    var def = uno.Render.DEFAULT_SETTINGS;
    if (!settings.canvas)
        return uno.error('Can not create render, settings.canvas is not defined');
    this.clearColor = settings.clearColor ? settings.clearColor.clone() : def.clearColor.clone();
    this.fps = settings.fps === 0 ? 0 : (settings.fps || def.fps);
    this.ups = settings.ups === 0 ? 0 : (settings.ups || def.ups);
    this._displayCanvas = this._canvas = settings.canvas;
    this._transparent = settings.transparent !== undefined ? !!settings.transparent : def.transparent;
    this._autoClear = settings.autoClear !== undefined ? !!settings.autoClear : def.autoClear;
    this._antialias = settings.antialias !== undefined ? !!settings.antialias : def.antialias;
    if (uno.Browser.ie) {
        this._canvas.style['-ms-content-zooming'] = 'none';
        this._canvas.style['-ms-touch-action'] = 'none';
    }
    if (!this._contextMenu)
        this._canvas.oncontextmenu = function() { return false; };
};

/**
 * Initialize render specific properties helper
 * @private
 */
uno.CanvasRender.prototype._setupProps = function() {
    this._currentMatrix = new uno.Matrix();
    this._clearMatrixTemp = new uno.Matrix();
    this._clearColorTemp = new uno.Color();
    this._target = null;
};

/**
 * Initialize the render bounds tracking
 * @private
 */
uno.CanvasRender.prototype._setupBounds = function() {
    this._bounds = new uno.Rect();
    this._boundsScroll = new uno.Point();
};

/**
 * Update render bounds
 * @private
 */
uno.CanvasRender.prototype._updateBounds = function() {
    var rect = this._canvas.getBoundingClientRect();
    this._bounds.set(rect.left, rect.top, rect.width, rect.height);
    this._boundsScroll.set(uno.Screen.scrollX, uno.Screen.scrollY);
};

/**
 * Create Canvas context
 * @private
 */
uno.CanvasRender.prototype._createContext = function() {
    var options = {
        alpha: this._transparent
    };
    this._displayContext = this._context = this._canvas.getContext ? this._canvas.getContext('2d', options) : null;
    if (!this._context)
        return uno.error('This browser does not support canvas. Try using another browser');
    this._hasResetTransform = !!this._context.resetTransform;
    uno.CanvasRender._initSmoothing(this._context);
    uno.CanvasRender._initBlendModes();
    return true;
};

/**
 * Initialize viewport size
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
 * @private
 */
uno.CanvasRender.prototype._setupViewport = function(settings) {
    var width = settings.width || uno.Screen.availWidth;
    var height = settings.height || uno.Screen.availHeight;
    this.resize(width, height);
};

/**
 * Initialize helpers
 * @private
 */
uno.CanvasRender.prototype._setupManagers = function() {
    this._graphics = new uno.CanvasGraphics(this);
};

/**
 * Register render in global list of renders
 * @private
 */
uno.CanvasRender.prototype._registerRender = function() {
    this.id = uno.Render._uid++;
    uno.Render.renders[this.id] = this;
};

/**
 * Initialize frame callback
 * @private
 */
uno.CanvasRender.prototype._setupFrame = function() {
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
uno.CanvasRender.prototype._onFrame = function(time) {
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
        this._lastRenderTime = time;
    }
};

/**
 * Reset render state after frame
 * @private
 */
uno.CanvasRender.prototype._resetState = function() {
    this._setAlpha(1);
    this._setScaleMode(uno.Render.SCALE_DEFAULT);
    this.blendMode(uno.Render.BLEND_NORMAL);
    this.transform(uno.Matrix.IDENTITY);
    var defaults = uno.Render.DEFAULT_GRAPHICS;
    this.fillColor(defaults.fillColor);
    this.lineColor(defaults.lineColor);
    this.lineWidth(defaults.lineWidth);
    if (this._autoClear)
        this.clear();
};

/**
 * Set opacity helper
 * @param {Number} alpha - Alpha value
 * @private
 */
uno.CanvasRender.prototype._setAlpha = function(alpha) {
    alpha = alpha || 1;
    if (this._currentAlpha === alpha)
        return;
    this._currentAlpha = alpha;
    this._context.globalAlpha = alpha;
};

/**
 * Set scale mode if image smooth property supported
 * @param {Number} scaleMode - See {@link uno.Render} constants
 * @private
 */
uno.CanvasRender.prototype._setScaleMode = function(scaleMode) {
    scaleMode = scaleMode || uno.Render.SCALE_DEFAULT;
    if (this._currentScaleMode === scaleMode || !uno.CanvasRender._smoothProperty)
        return;
    this._currentScaleMode = scaleMode;
    this._context[uno.CanvasRender._smoothProperty] = scaleMode === uno.Render.SCALE_LINEAR;
};

/**
 * Check for support new blend modes in Canvas context
 * @returns {Boolean}
 * @private
 */
uno.CanvasRender._blendModesSupported = function() {
    if (uno.CanvasRender._blendModesSupport !== undefined)
        return uno.CanvasRender._blendModesSupport;
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1, 1);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 1, 1);
    uno.CanvasRender._blendModesSupport = ctx.getImageData(0, 0, 1, 1).data[0] === 0;
    return uno.CanvasRender._blendModesSupport;
};

/**
 * Initialize Canvas blend modes
 * @private
 */
uno.CanvasRender._initBlendModes = function() {
    if (uno.CanvasRender._blendModes)
        return;
    var supported = this._blendModesSupported();
    var result = {};
    result[uno.Render.BLEND_NONE]       = 'source-over';
    result[uno.Render.BLEND_NORMAL]     = 'source-over';
    result[uno.Render.BLEND_ADD]        = 'lighter';
    result[uno.Render.BLEND_MULTIPLY]   = supported ? 'multiply' : 'source-over';
    result[uno.Render.BLEND_SCREEN]     = supported ? 'screen' : 'source-over';
    uno.CanvasRender._blendModes = result;
};

/**
 * Initialize canvas image smoothing property
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @private
 */
uno.CanvasRender._initSmoothing = function(ctx) {
    if (uno.CanvasRender._smoothProperty !== undefined)
        return;
    uno.CanvasRender._smoothProperty = false;
    var vendor = ['', 'webkit', 'moz', 'o'];
    for (var i = 0, l = vendor.length; i < l && !this._smoothProperty; ++i) {
        var property = vendor[i] + 'imageSmoothingEnabled';
        if (property in ctx)
            uno.CanvasRender._smoothProperty = property;
    }
};
/**
 * WebGL shader implementation
 * @param {uno.WebglRender} render - WebGL render instance
 * @param {Object} settings - Shader settings
 * @constructor
 */
uno.WebglShader = function(render, settings) {
    /**
     * Host render
     * @type {uno.WebglRender}
     * @private
     */
    this._render = render;

    /**
     * Settings for shader (see examples in ./shaders folder)
     * @type {Object}
     * @private
     */
    this._settings = settings;

    this._restore();
    render._addRestore(this);
};

/**
 * Type Sampler for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.SAMPLER = 0;

/**
 * Type Sampler for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.MATRIX = 1;

/**
 * Type Byte for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.BYTE = 2;

/**
 * Type Unsigned byte for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.UNSIGNED_BYTE = 3;

/**
 * Type Short for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.SHORT = 4;

/**
 * Type Unsigned short for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.UNSIGNED_SHORT = 5;

/**
 * Type Integer for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.INT = 6;

/**
 * Type Unsigned integer for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.UNSIGNED_INT = 7;

/**
 * Type Float for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.FLOAT = 8;

/**
 * Free all allocated resources and destroy shader
 */
uno.WebglShader.prototype.destroy = function() {
    this._render._removeRestore(this);
    this._render._context.deleteProgram(this.program);
    this._render = null;
    this._settings = null;
    this._program = null;
    this._attributes = null;
    this._uniforms = null;
    this._size = 0;
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglShader.prototype._restore = function() {
    var ctx = this._render._context;
    var settings = this._settings;
    var program = uno.WebglShader._createProgram(ctx, settings.vertex, settings.fragment);
    ctx.useProgram(program);
    this._attributes = [];
    this._uniforms = [];
    var name, params, value;
    this._size = 0;
    for (name in settings.attributes) {
        params = settings.attributes[name];
        this._attributes.push(name);
        value = {};
        value.location = ctx.getAttribLocation(program, name);
        value.type = uno.WebglShader._getType(ctx, params[0]);
        value.count = params[1];
        value.normalized = !!params[2];
        value.size = uno.WebglShader._getSize(ctx, params[0]) * value.count;
        this._size += value.size;
        this[name] = value;
    }
    for (name in settings.uniforms) {
        params = settings.uniforms[name];
        this._uniforms.push(name);
        value = {};
        value.location = ctx.getUniformLocation(program, name);
        value.type = uno.WebglShader._getType(ctx, params[0]);
        value.count = params[1];
        value.values = this.setUniformValues.bind(this, value);
        value.vector = this.setUniformVector.bind(this, value);
        value.matrix = this.setUniformMatrix.bind(this, value);
        value.texture = this.setUniformTexture.bind(this, value);
        this[name] = value;
    }
    this._program = program;
};

/**
 * Sets uniforms from arguments
 */
uno.WebglShader.prototype.setUniformValues = function() {
    var len = arguments.length;
    if (len < 2)
        return;
    var ctx = this._render._context;
    var uniform = arguments[0];
    var type = uniform.type;
    if (type === ctx.BYTE || type === ctx.UNSIGNED_BYTE || type === ctx.SHORT ||
        type === ctx.UNSIGNED_SHORT || type === ctx.SHORT || type === ctx.INT || type === ctx.UNSIGNED_INT) {
        switch (uniform.count) {
            case 1: ctx.uniform1i(uniform.location, arguments[1]); break;
            case 2: ctx.uniform2i(uniform.location, arguments[1], arguments[2]); break;
            case 3: ctx.uniform3i(uniform.location, arguments[1], arguments[2], arguments[3]); break;
            case 4: ctx.uniform4i(uniform.location, arguments[1], arguments[2], arguments[3], arguments[4]); break;
        }
    } else if (type === ctx.FLOAT) {
        switch (uniform.count) {
            case 1: ctx.uniform1f(uniform.location, arguments[1]); break;
            case 2: ctx.uniform2f(uniform.location, arguments[1], arguments[2]); break;
            case 3: ctx.uniform3f(uniform.location, arguments[1], arguments[2], arguments[3]); break;
            case 4: ctx.uniform4f(uniform.location, arguments[1], arguments[2], arguments[3], arguments[4]); break;
        }
    }
};

/**
 * Set vector to uniform
 * @param {Object} uniform - Uniform instance
 * @param {Array} vector - The data to set
 */
uno.WebglShader.prototype.setUniformVector = function(uniform, vector) {
    var ctx = this._render._context;
    var type = uniform.type;
    if (type === ctx.BYTE || type === ctx.UNSIGNED_BYTE || type === ctx.SHORT ||
        type === ctx.UNSIGNED_SHORT || type === ctx.SHORT || type === ctx.INT || type === ctx.UNSIGNED_INT) {
        ctx['uniform' + uniform.count + 'iv'](uniform.location, vector);
    } else if (type === ctx.FLOAT) {
        ctx['uniform' + uniform.count + 'if'](uniform.location, vector);
    }
};

/**
 * Set matrix to uniform
 * @param {Object} uniform - Uniform instance
 * @param {uno.Matrix} matrix - The matrix to set
 * @param {Boolean} transpose - Transponse the matrix
 */
uno.WebglShader.prototype.setUniformMatrix = function(uniform, matrix, transpose) {
    this._render._context['uniformMatrix' + Math.max(2, uniform.count) + 'fv'](
        uniform.location, transpose === true, matrix.array());
};

/**
 * Set texture to uniform
 * @param {Object} uniform - Uniform instance
 * @param {Number} index - Texture index
 * @param {WebGLTexture} texture - Texture instance
 */
uno.WebglShader.prototype.setUniformTexture = function(uniform, index, texture) {
    var ctx = this._render._context;
    ctx.activeTexture(ctx['TEXTURE' + index]);
    ctx.bindTexture(ctx.TEXTURE_2D, texture);
    ctx.uniform1i(uniform.location, index);
};

/**
 * Use this shader in render
 */
uno.WebglShader.prototype.use = function() {
    var ctx = this._render._context;
    var attr, offset = 0;
    ctx.useProgram(this._program);
    for (var i = 0, l = this._attributes.length; i < l; ++i) {
        attr = this[this._attributes[i]];
        ctx.enableVertexAttribArray(attr.location);
        ctx.vertexAttribPointer(attr.location, attr.count, attr.type, attr.normalized, this._size, offset);
        offset += attr.size;
    }
};

/**
 * Create shader program from vertex and fragment shaders
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @param {String} vertexShader - Vertex shader code
 * @param {String} fragmentShader - Fragment shader code
 * @returns {WebGLProgram} - Shader program
 * @private
 */
uno.WebglShader._createProgram = function(ctx, vertexShader, fragmentShader) {
    var program = ctx.createProgram();
    ctx.attachShader(program, uno.WebglShader._compileShader(ctx, ctx.VERTEX_SHADER, vertexShader));
    ctx.attachShader(program, uno.WebglShader._compileShader(ctx, ctx.FRAGMENT_SHADER, fragmentShader));
    ctx.linkProgram(program);
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS) && !ctx.isContextLost())
        return uno.error('Program filed to link:', ctx.getProgramInfoLog(program));
    return program;
};

/**
 * Compile shader code
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @param {Number} type - Type of the shader code (ctx.VERTEX_SHADER or ctx.FRAGMENT_SHADER)
 * @param {String} source - The shader source code
 * @returns {WebGLShader} - Compiled shader
 * @private
 */
uno.WebglShader._compileShader = function(ctx, type, source) {
    var shader = ctx.createShader(type);
    ctx.shaderSource(shader, typeof source === 'string' ? source : source.join('\n'));
    ctx.compileShader(shader);
    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS) && !ctx.isContextLost())
        return uno.error('Could not compile shader:', ctx.getShaderInfoLog(shader));
    return shader;
};

/**
 * Size conversion helper
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @param {Number} type - Internal type
 * @returns {Number} - WebGL type
 * @private
 */
uno.WebglShader._getType = function(ctx, type) {
    switch (type) {
        case uno.WebglShader.BYTE:
            return ctx.BYTE;
        case uno.WebglShader.UNSIGNED_BYTE:
            return ctx.UNSIGNED_BYTE;
        case uno.WebglShader.SHORT:
            return ctx.SHORT;
        case uno.WebglShader.UNSIGNED_SHORT:
            return ctx.UNSIGNED_SHORT;
        case uno.WebglShader.INT:
            return ctx.INT;
        case uno.WebglShader.UNSIGNED_INT:
            return ctx.UNSIGNED_INT;
        case uno.WebglShader.FLOAT:
            return ctx.FLOAT;
        case uno.WebglShader.MATRIX:
            return type;
        case uno.WebglShader.SAMPLER:
            return type;
    }
};

/**
 * Get size in bytes of the type helper
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @param {Number} type - The type
 * @returns {Number} - Size in bytes
 * @private
 */
uno.WebglShader._getSize = function(ctx, type) {
    switch (type) {
        case uno.WebglShader.BYTE:
            return 1;
        case uno.WebglShader.UNSIGNED_BYTE:
            return 1;
        case uno.WebglShader.SHORT:
            return 2;
        case uno.WebglShader.UNSIGNED_SHORT:
            return 2;
        case uno.WebglShader.INT:
            return 4;
        case uno.WebglShader.UNSIGNED_INT:
            return 4;
        case uno.WebglShader.FLOAT:
            return 4;
    }
};
/**
 * Primitive shader for rendering shapes in graphics batch
 * @property {Object} default
 * @property {String} default.name - Name of the shader
 * @property {String[]} default.fragment - Fragment shader
 * @property {String[]} default.vertex - Vertex shader
 * @property {Object} default.attributes - Shader attributes
 * @property {Object} default.uniforms - Shader uniforms
 */
uno.WebglShader.PRIMITIVE = {
    name: 'primitive',
    fragment: [
        'precision lowp float;',
        'varying vec4 vColor;',

        'void main(void) {',
        '   gl_FragColor = vColor;',
        '}'
    ],
    vertex: [
        'attribute vec2 aPosition;',
        'attribute vec4 aColor;',
        'uniform vec2 uProjection;',
        'varying vec4 vColor;',
        'const vec2 cOffset = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4(aPosition / uProjection + cOffset, 0.0, 1.0);',
        '   vColor = aColor;',
        '}'
    ],
    attributes: {
        aPosition: [uno.WebglShader.FLOAT, 2],
        aColor: [uno.WebglShader.UNSIGNED_BYTE, 4, true]    // Using packing ABGR (alpha and tint color)
    },
    uniforms: {
        uProjection: [uno.WebglShader.FLOAT, 2],
        uOffset: [uno.WebglShader.FLOAT, 2]
    }
};
/**
 * Shader for rendering in sprite batch
 * @property {Object} default
 * @property {String} default.name - Name of the shader
 * @property {String[]} default.fragment - Fragment shader
 * @property {String[]} default.vertex - Vertex shader
 * @property {Object} default.attributes - Shader attributes
 * @property {Object} default.uniforms - Shader uniforms
 */
uno.WebglShader.SPRITE = {
    name: 'sprite',
    fragment: [
        'precision lowp float;',
        'varying vec2 vUV;',
        'varying vec4 vColor;',
        'uniform sampler2D uSampler;',

        'void main(void) {',
        '   gl_FragColor = texture2D(uSampler, vUV) * vColor;',
        '}'
    ],
    vertex: [
        'attribute vec2 aPosition;',
        'attribute vec2 aUV;',
        'attribute vec4 aColor;',
        'uniform vec2 uProjection;',
        'varying vec2 vUV;',
        'varying vec4 vColor;',
        'const vec2 cOffset = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4(aPosition / uProjection + cOffset, 0.0, 1.0);',
        '   vUV = aUV;',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ],
    attributes: {
        aPosition: [uno.WebglShader.FLOAT, 2],
        aUV: [uno.WebglShader.FLOAT, 2],
        aColor: [uno.WebglShader.UNSIGNED_BYTE, 4, true]    // Using packing ABGR (alpha and tint color)
    },
    uniforms: {
        uProjection: [uno.WebglShader.FLOAT, 2],
        uSampler: [uno.WebglShader.SAMPLER, 1],
        uOffset: [uno.WebglShader.FLOAT, 2]
    }
};
/**
 * WebGL implementation for rendering graphics shapes
 * @param {uno.WebglRender} render - WebGL render instance
 * @constructor
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
    this._smooth = 5;

    /**
     * Working shader (primitive)
     * @type {uno.WebglShader}
     * @private
     */
    this._currentShader = null;

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
     * View for tint colors array with uint32 type (for abgr pack - alpha and tint color)
     * @type {Uint32Array}
     * @private
     */
    this._colors = new Uint32Array(this._vertices);

    /**
     * Min size in vertices of shape (line, rect)
     * @type {Number}
     * @private
     */
    this._minShapeSize = 4;

    /**
     * Default blend mode to reset. See {@link uno.Render} constants
     * @type {Number}
     * @private
     */
    this._defaultBlendMode = uno.Render.BLEND_NORMAL;

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
    this._stateBlendModes = new Uint8Array(this._maxVertexCount / this._minShapeSize);

    /**
     * Last blend mode added to states
     * @type {Number}
     * @private
     */
    this._stateBlendModeLast = -1;

    /**
     * Current composed shape
     * @type {uno.Shape}
     * @private
     */
    this._shape = null;

    this._shapeIndex = 0;
    this._shapeVertex = 0;
    this._shapeMatrix = new uno.Matrix();

    /**
     * Current fill color
     * @type {uno.Color}
     * @private
     */
    this._currentFillColor = uno.Render.DEFAULT_GRAPHICS.fillColor.clone();

    /**
     * Current line color
     * @type {uno.Color}
     * @private
     */
    this._currentLineColor = uno.Render.DEFAULT_GRAPHICS.lineColor.clone();

    /**
     * Current line width
     * @type {uno.Color}
     * @private
     */
    this._currentLineWidth = uno.Render.DEFAULT_GRAPHICS.lineWidth;

    this._restore();
    render._addRestore(this);
};

/**
 * Free all allocated resources and destroy graphics
 */
uno.WebglGraphics.prototype.destroy = function() {
    this._render._removeRestore(this);
    var ctx = this._render._context;
    ctx.destroyBuffer(this._vertexBuffer);
    ctx.destroyBuffer(this._indexBuffer);
    this._indices = null;
    this._vertices = null;
    this._currentShader = null;
    this._render = null;
    this._states = null;
    this._stateBlendModes = null;
    this._shapeMatrix = null;
    this._currentFillColor = null;
    this._currentLineColor = null;
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglGraphics.prototype._restore = function() {
    var ctx = this._render._context;
    this._vertexBuffer = ctx.createBuffer();
    this._indexBuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this._vertexBuffer);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, this._indices, ctx.DYNAMIC_DRAW);
    ctx.bufferData(ctx.ARRAY_BUFFER, this._vertices, ctx.DYNAMIC_DRAW);
};

/**
 * Render all current shapes and free batch buffers
 * @returns {Boolean} - Is rendered anything
 */
uno.WebglGraphics.prototype.flush = function() {
    if (!this._vertexCount)
        return false;

    var render = this._render;
    var ctx = render._context;

    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this._vertexBuffer);

    var shader = this._currentShader;
    if (!shader)
        shader = this._currentShader = render._getShader(uno.WebglShader.PRIMITIVE);
    if (shader !== render._getShader())
        render._setShader(shader);

    if (this._vertexCount > this._maxVertexCount * 0.5) {
        ctx.bufferSubData(ctx.ELEMENT_ARRAY_BUFFER, 0, this._indices);
        ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this._vertices);
    } else {
        ctx.bufferSubData(ctx.ELEMENT_ARRAY_BUFFER, 0, this._indices.subarray(0, this._indexCount));
        ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this._positions.subarray(0, this._vertexCount * this._vertexSize));
    }

    var states = this._states;
    var modes = this._stateBlendModes;
    var index = 0;
    var count = 0;

    for (var i = 0, l = this._stateCount; i < l; ++i) {
        render._applyBlendMode(modes[i]);
        count = states[i];
        ctx.drawElements(ctx.TRIANGLES, count - index, ctx.UNSIGNED_SHORT, index * 2);
        index = count;
    }

    this._stateBlendModeLast = this._defaultBlendMode;
    this._stateCount = 0;
    this._vertexCount = 0;
    this._indexCount = 0;

    return true;
};

/**
 * Set current shape fill color
 * @param {uno.Color} color - Shape fill color
 * @returns {uno.Color} - Current fill color
 */
uno.WebglGraphics.prototype.fillColor = function(color) {
    if (color === undefined || this._currentFillColor.equal(color ? color : uno.Color.TRANSPARENT))
        return this._currentFillColor;
    return this._currentFillColor.set(color ? color : uno.Color.TRANSPARENT);
};

/**
 * Set current shape line color
 * @param {uno.Color} color - Shape line color
 * @returns {uno.Color} - Current line color
 */
uno.WebglGraphics.prototype.lineColor = function(color) {
    if (color === undefined || this._currentLineColor.equal(color ? color : uno.Color.TRANSPARENT))
        return this._currentLineColor;
    return this._currentLineColor.set(color ? color : uno.Color.TRANSPARENT);
};

/**
 * Set current shape line width
 * @param {Number} width - Shape line width
 * @returns {Number} - Current line width
 */
uno.WebglGraphics.prototype.lineWidth = function(width) {
    if (width === undefined || width === null || width < 0)
        return this._currentLineWidth;
    return this._currentLineWidth = width;
};

/**
 * Start collect new shape
 * @returns {uno.Shape} - Created shape
 */
uno.WebglGraphics.prototype.startShape = function() {
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
    shape._vertices = new Float32Array(this._positions.subarray(this._shapeVertex, vc * this._vertexSize));
    shape._states = new Uint16Array(this._states.subarray(this._shapeState, sc));
    shape._blends = new Uint8Array(this._stateBlendModes.subarray(this._shapeState, sc));
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
uno.WebglGraphics.prototype.drawShape = function(shape) {
    if (!shape.items || !shape.items.length)
        return false;
    var i, l, source;
    var render = this._render;
    var matrix = this._shapeMatrix.set(render._currentMatrix);
    var identity = uno.Matrix.IDENTITY;
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;
    var blendMode = render._currentBlendMode;

    // If shape not made
    if (!shape._indices || !shape._vertices) {
        this._shapeIndex = this._indexCount;
        this._shapeVertex = this._vertexCount;
        this._shapeState = this._stateCount;
        var items = shape.items, item;
        var types = uno.Shape;
        for (i = 0, l = items.length; i < l; ++i) {
            item = items[i];
            source = item.shape;
            render._currentMatrix.set(item.matrix ? item.matrix : identity);
            render._currentBlendMode = item.blendMode;
            this._currentFillColor = item.fillColor;
            this._currentLineColor = item.lineColor;
            this._currentLineWidth = item.lineWidth;
            switch (item.type) {
                case types.LINE:
                    this.drawLine(source.x1, source.y1, source.x2, source.y2);
                    break;
                case types.RECT:
                    this.drawRect(source.x, source.y, source.width, source.height);
                    break;
                case types.CIRCLE:
                    this.drawCircle(source.x, source.y, source.radius);
                    break;
                case types.ELLIPSE:
                    this.drawEllipse(source.x, source.y, source.width, source.height);
                    break;
                case types.ARC:
                    this.drawArc(source.x, source.y, source.radius, source.startAngle, source.endAngle, source.antiClockwise);
                    break;
                case types.POLY:
                    this.drawPoly(source.points);
                    break;
            }
        }
        this._shape = shape;
        this.endShape();
        this._currentFillColor = fillColor;
        this._currentLineColor = lineColor;
        this._currentLineWidth = lineWidth;
        render._currentBlendMode = blendMode;
        render._currentMatrix.set(matrix);
    }

    // Check for max batch size limitation
    if (this._maxVertexCount - this._vertexCount < shape._vertices.length)
        this.flush();

    // Copy all indices
    var j, dest;
    dest = this._indices;
    source = shape._indices;
    i = source.length + 1;
    j = this._indexCount + i;
    this._indexCount = j - 1;
    while (i)
        dest[--j] = source[--i];

    // Copy all vertices
    dest = this._positions;
    source = shape._vertices;
    i = source.length;
    j = this._vertexCount + i;
    this._vertexCount = j;

    if (matrix.identity()) {
        // If current matrix empty use simple copy vertices
        while (i)
            dest[--j] = source[--i];
    } else {
        // If not, transform all vertices using current matrix
        var x, y;
        var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;

        while (i > 0) {
            dest[--j] = source[--i];
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
    dest = this._stateBlendModes;
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
uno.WebglGraphics.prototype.drawLine = function(x1, y1, x2, y2) {
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;

    if (!lineWidth || !lineColor || !lineColor.a)
        return false;
    if (x1 === x2 && y1 === y2)
        return false;

    if (this._maxVertexCount - this._vertexCount < 4)
        this.flush();

    var matrix = this._render._currentMatrix;
    var blendMode = this._render._currentBlendMode;

    if (this._shape) {
        this._shape.add(matrix, uno.Shape.types.LINE,
            new uno.Line(x1, y1, x2, y2), null, lineColor, lineWidth, blendMode);
    }

    var color = lineColor.packedABGR;
    var w = lineWidth * 0.5;
    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
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
    this._saveState(blendMode);
    if (this._vertexCount >= this._maxVertexCount)
        this.flush();
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
uno.WebglGraphics.prototype.drawRect = function(x, y, width, height) {
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;

    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (width === 0 || height === 0)
        return false;

    if (this._maxVertexCount - this._vertexCount < 12)
        this.flush();

    var matrix = this._render._currentMatrix;
    var blendMode = this._render._currentBlendMode;

    if (this._shape) {
        this._shape.add(matrix, uno.Shape.types.RECT,
            new uno.Rect(x, y, width, height), fillColor, lineColor, lineWidth, blendMode);
    }

    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
    var vc = this._vertexCount;
    var vi = vc * this._vertexSize;
    var ii = this._indexCount;
    var vx = this._positions;
    var cc = this._colors;
    var ix = this._indices;
    var i, j;
    var w, color;

    if (fillColor && fillColor.a) {
        color = fillColor.packedABGR;
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

    if (lineWidth && lineColor && lineColor.a) {
        color = lineColor.packedABGR;
        w = lineWidth * 0.5;
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
    this._saveState(blendMode);
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
uno.WebglGraphics.prototype.drawCircle = function(x, y, radius) {
    if (this._shape) {
        this._shape.add(this._render._currentMatrix, uno.Shape.types.CIRCLE,
            new uno.Circle(x, y, radius), this._currentFillColor, this._currentLineColor,
            this._currentLineWidth, this._render._currentBlendMode);
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
uno.WebglGraphics.prototype.drawEllipse = function(x, y, width, height) {
    if (this._shape) {
        this._shape.add(this._render._currentMatrix, uno.Shape.types.ELLIPSE,
            new uno.Ellipse(x, y, width, height), this._currentFillColor, this._currentLineColor,
            this._currentLineWidth, this._render._currentBlendMode);
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
uno.WebglGraphics.prototype.drawArc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;

    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (radius === 0)
        return false;
    if (startAngle === endAngle)
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

    var matrix = this._render._currentMatrix;
    var blendMode = this._render._currentBlendMode;

    if (this._shape) {
        this._shape.add(matrix, uno.Shape.types.ARC,
            new uno.Arc(x, y, radius, startAngle, endAngle, antiClockwise), fillColor, lineColor, lineWidth, blendMode);
    }

    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
    var color;
    var vc = this._vertexCount;
    var ii = this._indexCount;
    var vi = vc * this._vertexSize;
    var vx = this._positions;
    var cc = this._colors;
    var ix = this._indices;
    var i, k, sin, cos, sx, sy, px1, py1, px2, py2;

    var arc = angle !== pi2;
    var segments = Math.round(Math.round(this._smooth * Math.sqrt(radius)) / pi2 * (angle < 0 ? -angle : angle));
    var delta = angle / segments;
    if (arc)
        ++segments;

    if (this._maxVertexCount - this._vertexCount < segments * 3) {
        this.flush();
        vc = this._vertexCount;
        ii = this._indexCount;
        vi = vc * this._vertexSize;
    }

    if (fillColor && fillColor.a) {
        color = fillColor.packedABGR;
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

    if (lineWidth && lineColor && lineColor.a) {
        color = lineColor.packedABGR;
        k = vc + segments * 2;
        lineWidth *= 0.5;
        px1 = radius - lineWidth;
        py1 = 0;
        px2 = radius + lineWidth;
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
    this._saveState(blendMode);
    if (this._vertexCount >= this._maxVertexCount)
        this.flush();

    return true;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {Boolean} - Is polyline rendered
 */
uno.WebglGraphics.prototype.drawPoly = function(points) {
    var len = points.length;
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;

    if (len < 2 || (!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    var p1, p2;
    if (len === 2) {
        p1 = points[0];
        p2 = points[1];
        this.drawLine(p1.x, p1.y, p2.x, p2.y);
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

    var matrix = this._render._currentMatrix;
    var blendMode = this._render._currentBlendMode;

    if (this._shape) {
        this._shape.add(matrix, uno.Shape.types.POLY,
            new uno.Poly(points), fillColor, lineColor, lineWidth, blendMode);
    }

    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
    var color;
    var p3, x1, y1, x2, y2, x3, y3, i, j, l, den;
    var px1, py1, px2, py2, px3, py3, ix1, iy1, ix2, iy2, dx1, dy1, dx2, dy2, dx3, dy3, dc;

    if (fillColor && fillColor.a) {
        color = fillColor.packedABGR;
        l = len;
        if (points[0].equal(points[len - 1]))
            --l;
        i = vi;

        var i0, i1, i2, found;
        var d00, d01, d02, d11, d12;
        var indices = [];

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

    if (lineWidth && lineColor && lineColor.a) {
        color = lineColor.packedABGR;
        p1 = points[0];
        p2 = points[len - 1];
        var w = lineWidth * 0.5;
        var closed = p1.x === p2.x && p1.y === p2.y;
        var cap;
        var fx1, fy1, fx2, fy2;
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
    this._saveState(blendMode);
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
    var fillColor = this._currentFillColor;
    var lineColor = this._currentLineColor;
    var lineWidth = this._currentLineWidth;

    if ((!fillColor || !fillColor.a) && (!lineWidth || !lineColor || !lineColor.a))
        return false;
    if (width === 0 || height === 0)
        return false;

    var matrix = this._render._currentMatrix;
    var blendMode = this._render._currentBlendMode;
    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
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

    segments = Math.round(this._smooth * Math.sqrt(Math.max(width, height)));
    delta = uno.Math.TWO_PI / segments;
    cos = Math.cos(delta);
    sin = Math.sin(delta);

    if (this._maxVertexCount - this._vertexCount < segments * 3 + 1) {
        this.flush();
        vc = this._vertexCount;
        ii = this._indexCount;
        vi = vc * this._vertexSize;
    }

    if (fillColor && fillColor.a) {
        color = fillColor.packedABGR;
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

    if (lineWidth && lineColor && lineColor.a) {
        color = lineColor.packedABGR;
        angle = 0;
        k = vc + segments * 2;
        w = lineWidth * 0.5;

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
    this._saveState(blendMode);
    if (this._vertexCount >= this._maxVertexCount)
        this.flush();

    return true;
};

/**
 * Save blend mode state for batching
 * @param {Number} blendMode - Changed blend mode. See {@link uno.Render} constants
 * @private
 */
uno.WebglGraphics.prototype._saveState = function(blendMode) {
    blendMode = blendMode || uno.Render.BLEND_NORMAL;
    if (blendMode === this._stateBlendModeLast && this._stateCount) {
        this._states[this._stateCount - 1] = this._indexCount;
        return;
    }
    this._states[this._stateCount] = this._indexCount;
    this._stateBlendModes[this._stateCount] = blendMode;
    this._stateBlendModeLast = blendMode;
    ++this._stateCount;
};

/**
 * WebGL texture extension
 * @param {uno.Texture} texture - Texture that holds this extension
 * @constructor
 */
uno.WebglTexture = function(texture) {
    /**
     * Parent texture for this extension
     * @type {uno.Texture}
     * @private
     */
    this.texture = texture;

    /**
     * Handles for each render<br>
     *     Objects with handles <code>{ texture: TEXTURE_HANDLE, buffer: FRAME_BUFFER_HANDLE }</code>,<br>
     *     buffer is null for not render textures (with texture._source not null)
     * @type {Object[]}
     * @private
     */
    this._handles = {};

    /**
     * Image data for methods getPixels/setPixels
     * @type {Uint8ClampedArray}
     * @private
     */
    this._imageData = null;
};

/**
 * Free all allocated resources and destroy texture extension
 */
uno.WebglTexture.prototype.destroy = function() {
    if (!this._handles)
        return;
    for (var id in this._handles) {
        var render = uno.Render.renders[id];
        var handle = this._handles[id];
        render._removeRestore(this);
        render._context.deleteTexture(handle.texture);
        if (handle.buffer)
            render._context.deleteFramebuffer(handle.buffer);
    }
    this._handles = null;
    this.texture = null;
};

/**
 * Get texture handle for render<br>
 *     This function called very frequently, try avoid variable creation
 * @param {uno.WebglRender} render - The render associated with handle
 * @param {Boolean} [buffer=false] - Return render buffer handle, not texture handle
 * @param {Boolean} [create=true] - Should create texture or render buffer handle if it not exist
 * @returns {WebGLTexture|WebGLFramebuffer} - Corresponding texture or render buffer handle
 */
uno.WebglTexture.prototype.handle = function(render, buffer, create) {
    var handles = this._handles[render.id];
    if (!handles || (buffer ? !handles.buffer : !handles.texture)) {
        if (create === false)
            return false;
        this._create(render);
        render._addRestore(this);
        return buffer ? this._handles[render.id].buffer : this._handles[render.id].texture;
    }
    return buffer ? handles.buffer : handles.texture;
};

/**
 * Get or set texture pixels
 * @returns {Uint8ClampedArray}
 */
uno.WebglTexture.prototype.getPixels = function(render) {
    var tex = this.texture;
    var len = tex.width * tex.height * 4;

    if (!this._imageData || this._imageData.length !== len) {
        this._imageBuffer = new ArrayBuffer(len);
        this._imageData = new Uint8Array(this._imageBuffer);
        this._imageDataClamped = new Uint8ClampedArray(this._imageBuffer);
    }

    var ctx = render._context;
    var buffer = this.handle(render, true, true);

    ctx.bindFramebuffer(ctx.FRAMEBUFFER, buffer);
    ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, this.handle(render), 0);
    ctx.readPixels(0, 0, tex.width, tex.height, ctx.RGBA, ctx.UNSIGNED_BYTE, this._imageData);

    // TODO: rewrite after changing method 'target' to property
    var target = render._target;
    if (target === null)
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
    else
        render.target(target);

    return this._imageDataClamped;
};

/**
 * Get or set texture pixels
 * @param {Uint8ClampedArray} data - Pixels data
 * @param {uno.WebglRender} render - For what render texture created
 * @returns {CanvasTexture} - <code>this</code>
 */
uno.WebglTexture.prototype.setPixels = function(data, render) {
    if (data !== this._imageDataClamped)
        this._imageDataClamped.set(data);
    var ctx = render._context;
    ctx.bindTexture(ctx.TEXTURE_2D, this.handle(render));
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, this.texture.width, this.texture.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, this._imageData);
    return this;
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglTexture.prototype._restore = function(render) {
    if (this._handles[render.id])
        delete this._handles[render.id];
};

/**
 * Create WebGL texture helper
 * @param {uno.WebglRender} render - For what render texture created
 * @returns {Object} - Object with handles <code>{ texture: TEXTURE_HANDLE, buffer: FRAME_BUFFER_HANDLE }</code>,<br>
 *     buffer is null for not render textures (with texture._source not null)
 * @private
 */
uno.WebglTexture.prototype._create = function(render) {
    var ctx = render._context;
    var texture = this.texture;
    var mode = texture.scaleMode === uno.Render.SCALE_LINEAR ? ctx.LINEAR : ctx.NEAREST;
    var textureHandle = ctx.createTexture();
    var bufferHandle = null;

    ctx.bindTexture(ctx.TEXTURE_2D, textureHandle);

    // Check is texture render target or not
    if (texture.url) {

        // TODO: should we flip texture or not?
        // ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);

        ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        // Here we should get image from CanvasTexture
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, uno.CanvasTexture.get(texture).handle());
    } else {
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, texture.width, texture.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);
        bufferHandle = this._createBuffer(ctx, textureHandle, texture.width, texture.height);
    }

    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, mode);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, mode);

    if (texture.pot) {
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
    } else {
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
    }

    ctx.bindTexture(ctx.TEXTURE_2D, null);

    this._handles[render.id] = { texture: textureHandle, buffer: bufferHandle };
};

/**
 * Create frame buffer
 * @param {WebGLRenderingContext} ctx - Render context
 * @param {WebGLTexture} textureHandle - Texture handle for frame buffer
 * @param {Number} width - Width of the frame buffer
 * @param {Number} height - Height of the frame buffer
 * @returns {WebGLFramebuffer}
 * @private
 */
uno.WebglTexture.prototype._createBuffer = function(ctx, textureHandle, width, height) {
    var handle = ctx.createFramebuffer();
    handle.width = width;
    handle.height = height;
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, handle);
    ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, textureHandle, 0);
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
    return handle;
};

/**
 * Get texture extension factory<br>
 *     This function called very frequently, try avoid variable creation
 * @param {uno.Texture} texture
 * @returns {uno.WebglTexture}
 */
uno.WebglTexture.get = function(texture) {
    if (!texture._extensions.webgl)
        texture._extensions.webgl = new uno.WebglTexture(texture);
    return texture._extensions.webgl;
};
/**
 * Sprite batcher for WebGL render. Used for rendering sprites with minimum draw calls
 * @param {uno.WebglRender} render - WebGL render instance
 * @constructor
 */
uno.WebglBatch = function(render) {
    /**
     * Host render
     * @type {uno.WebglRender}
     * @private
     */
    this._render = render;

    /**
     * Current used shader
     * @type {uno.WebglShader}
     * @private
     */
    this._currentShader = null;

    /**
     * Size of vertex in buffer (x, y, u, v, abgr pack - alpha and tint color, 4 byte each)
     * @type {Number}
     * @private
     */
    this._vertexSize = 5;

    /**
     * Size of sprite in buffer (4 vertices 5 values, 4 bytes each)
     * @type {Number}
     * @private
     */
    this._spriteSize = this._vertexSize * 4;

    /**
     * Maximum sprites in one batch
     * @type {Number}
     * @private
     */
    this._maxSpriteCount = 2000;

    /**
     * Indeces array (for each sprite 6 indices)
     * @type {UInt16Array}
     * @private
     */
    this._indices = new Uint16Array(this._maxSpriteCount * 6);

    /**
     * Array with all vertices data
     * @type {ArrayBuffer}
     * @private
     */
    this._vertices = new ArrayBuffer(this._maxSpriteCount * this._spriteSize * 4);

    /**
     * View for vertices array with float32 type (for x, y, u, v values fill)
     * @type {Float32Array}
     * @private
     */
    this._positions = new Float32Array(this._vertices);

    /**
     * View for tint colors array with uint32 type (for abgr pack - alpha and tint color)
     * @type {Uint32Array}
     * @private
     */
    this._colors = new Uint32Array(this._vertices);

    /**
     * Array states of the batch (each item is number of sprites with equal texture and blend mode together)
     * @type {Uint16Array}
     * @private
     */
    this._states = new Uint16Array(this._maxSpriteCount);

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
    this._stateBlendModes = new Uint8Array(this._maxSpriteCount);

    /**
     * Last blend mode added to states
     * @type {Number}
     * @private
     */
    this._stateBlendModeLast = -1;

    /**
     * Textures for each state of the batch
     * @type {Array}
     * @private
     */
    this._stateTextures = [];

    /**
     * Last texture added to states
     * @type {uno.Texture}
     * @private
     */
    this._stateTextureLast = null;

    /**
     * Count of sprites in batch
     * @type {Number}
     * @private
     */
    this._spriteCount = 0;

    this._prepare();
    this._restore();

    render._addRestore(this);
};

/**
 * Free all allocated resources and destroy sprite batch
 */
uno.WebglBatch.prototype.destroy = function() {
    this._render._removeRestore(this);
    var ctx = this._render._context;
    ctx.destroyBuffer(this._vertexBuffer);
    ctx.destroyBuffer(this._indexBuffer);
    this.texture = null;
    this._indices = null;
    this._vertices = null;
    this._positions = null;
    this._colors = null;
    this._currentShader = null;
    this._render = null;
    this._states = null;
    this._stateBlendModes = null;
    this._stateTextures = null;
};

/**
 * Prepare batch data
 * @private
 */
uno.WebglBatch.prototype._prepare = function() {
    this._stateTextures.length = this._maxSpriteCount;
    var indices = this._indices;
    for (var i = 0, j = 0, l = indices.length; i < l; i += 6, j += 4) {
        indices[i + 0] = j + 0;
        indices[i + 1] = j + 1;
        indices[i + 2] = j + 2;
        indices[i + 3] = j + 0;
        indices[i + 4] = j + 2;
        indices[i + 5] = j + 3;
    }
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglBatch.prototype._restore = function() {
    var ctx = this._render._context;
    this._vertexBuffer = ctx.createBuffer();
    this._indexBuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this._vertexBuffer);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, this._indices, ctx.STATIC_DRAW);
    ctx.bufferData(ctx.ARRAY_BUFFER, this._vertices, ctx.DYNAMIC_DRAW);
};

/**
 * Add sprite to batch queue
 * @param {uno.WebglTexture} texture - WebGL texture instance
 * @param {Number} x - The x-coordinate of the texture frame
 * @param {Number} y - The x-coordinate of the texture frame
 * @param {Number} width - The width of the texture frame
 * @param {Number} height - The height of the texture frame
 * @param {Number} alpha - Texture opacity
 * @param {uno.Color} tint - The texture tint color
 */
uno.WebglBatch.prototype.render = function(texture, x, y, width, height, alpha, tint) {
    var tw = texture.texture.width;
    var th = texture.texture.height;
    var render = this._render;
    var matrix = render._currentMatrix;
    var blendMode = render._currentBlendMode;
    var a = matrix.a;
    var b = matrix.c;   // TODO: why we flip values?
    var c = matrix.b;
    var d = matrix.d;
    var tx = matrix.tx;
    var ty = matrix.ty;

    // Using packing ABGR (alpha and tint color)
    var color = tint.packedABGR & 0x00ffffff | (alpha * 255 << 24);
    var i = this._spriteCount * this._spriteSize;
    var vp = this._positions;
    var vc = this._colors;

    var uvx0;
    var uvy0;
    var uvx1;
    var uvy1;

    // Check for render target and flip if it is
    if (texture.handle(render, true, false)) {
        uvx0 = x / tw;
        uvy0 = (y + height) / th;
        uvx1 = (x + width) / tw;
        uvy1 = y / th;
    } else {
        uvx0 = x / tw;
        uvy0 = y / th;
        uvx1 = (x + width) / tw;
        uvy1 = (y + height) / th;
    }

    vp[i++] = tx;
    vp[i++] = ty;
    vp[i++] = uvx0;
    vp[i++] = uvy0;
    vc[i++] = color;

    vp[i++] = a * width + tx;
    vp[i++] = b * width + ty;
    vp[i++] = uvx1;
    vp[i++] = uvy0;
    vc[i++] = color;

    vp[i++] = a * width + c * height + tx;
    vp[i++] = d * height + b * width + ty;
    vp[i++] = uvx1;
    vp[i++] = uvy1;
    vc[i++] = color;

    vp[i++] = c * height + tx;
    vp[i++] = d * height + ty;
    vp[i++] = uvx0;
    vp[i++] = uvy1;
    vc[i++] = color;

    ++this._spriteCount;
    this._saveState(texture.handle(render), blendMode);
    if (this._spriteCount >= this._maxSpriteCount)
        this.flush();
};

/**
 * Render all current batched textures and free batch buffers
 * @returns {Boolean} - Is rendered anything
 */
uno.WebglBatch.prototype.flush = function() {
    if (!this._spriteCount)
        return false;

    var render = this._render;
    var ctx = render._context;

    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this._vertexBuffer);

    var shader = this._currentShader;
    if (!shader)
        shader = this._currentShader = render._getShader(uno.WebglShader.SPRITE);
    if (shader !== render._getShader())
        render._setShader(shader);

    // If batch have size more than max half send it all to GPU, otherwise send subarray (minimize send size)
    if (this._spriteCount > this._maxSpriteCount * 0.5)
        ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this._vertices);
    else
        ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, this._positions.subarray(0, this._spriteCount * this._spriteSize));

    var states = this._states;
    var modes = this._stateBlendModes;
    var textures = this._stateTextures;
    var sampler = shader.uSampler;
    var index = 0;
    var count = 0;
    var texture, current = null;

    for (var i = 0, l = this._stateCount; i < l; ++i) {
        render._applyBlendMode(modes[i]);
        texture = textures[i];
        if (texture !== current) {
            sampler.texture(0, texture);
            current = texture;
        }
        count = states[i];
        ctx.drawElements(ctx.TRIANGLES, count - index, ctx.UNSIGNED_SHORT, index * 2);
        index = count;
    }

    // Clear all links to textures
    for (i = 0, l = this._stateCount; i < l; ++i)
        states[i] = null;
    this._stateTextureLast = null;

    this._stateBlendModeLast = uno.Render.BLEND_NORMAL;
    this._stateCount = 0;
    this._spriteCount = 0;
};

/**
 * Save texture and blend mode state for batching
 * @param {WebGLTexture} texture - Changed texture
 * @param {Number} blendMode - Changed blend mode. See {@link uno.Render} constants
 * @private
 */
uno.WebglBatch.prototype._saveState = function(texture, blendMode) {
    if (texture === this._stateTextureLast &&
        blendMode === this._stateBlendModeLast && this._stateCount) {
        this._states[this._stateCount - 1] = this._spriteCount * 6;
        return;
    }
    this._states[this._stateCount] = this._spriteCount * 6;
    this._stateTextures[this._stateCount] = texture;
    this._stateTextureLast = texture;
    this._stateBlendModes[this._stateCount] = blendMode;
    this._stateBlendModeLast = blendMode;
    ++this._stateCount;
};
/**
 * WebGL render
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
 * @constructor
 */
uno.WebglRender = function(settings) {
    /**
     * Type of render. See {@link uno.Render} constants
     * @type {Number}
     * @default uno.Render.RENDER_WEBGL
     */
    this.type = uno.Render.RENDER_WEBGL;

    /**
     * Root scene object
     * @type {uno.Object}
     */
    this.root = null;

    this._setupSettings(settings);
    this._setupProps();
    this._setupRestore();
    this._setupBounds();
    this._createContext();
    this._setupViewport(settings);
    this._setupManagers();
    this._resetState();
    this._registerRender();
    this._setupFrame();
};

/**
 * Resize viewport
 * @param {Number} width - New width of the viewport
 * @param {Number} height - New width of the viewport
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;
    this._canvas.width = width;
    this._canvas.height = height;
    this._projection.x = width / 2;
    this._projection.y = -height / 2;
    this._context.viewport(0, 0, width, height);
    this._updateBounds();
    this._updateShaders();
    return this;
};

/**
 * Free all allocated resources and destroy render
 */
uno.WebglRender.prototype.destroy = function() {
    delete uno.Render.renders[this.id];
    this._batch.destroy();
    this._batch = null;
    this._graphics.destroy();
    this._graphics = null;
    for (var i in this._shaders)
        this._shaders[i].destroy();
    this._currentShader = null;
    this._currentMatrix = null;
    this._targetMatrix = null;
    this._shaders = {};
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
    this.root = null;
};

/**
 * Get bounds of render
 * For browser bounds is position and size on page
 * For other platforms position and size on screen
 * @returns {uno.Rect}
 */
uno.WebglRender.prototype.bounds = function() {
    if (!this._boundsScroll.equal(uno.Screen.scrollX, uno.Screen.scrollY))
        this._updateBounds();
    return this._bounds;
};

/**
 * Set or reset render target texture
 * @param {uno.WebglTexture} texture - Texture for render buffer
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.target = function(texture) {
    this._graphics.flush();
    this._batch.flush();

    if (!texture) {
        this._target = null;
        this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);
        this._projection.x = this.width / 2;
        this._projection.y = -this.height / 2;
        this._updateShaders();
        this._context.viewport(0, 0, this.width, this.height);
    } else {
        this._target = texture;
        this._context.bindFramebuffer(this._context.FRAMEBUFFER, uno.WebglTexture.get(texture).handle(this, true));
        this._projection.x = texture.width / 2;
        this._projection.y = -texture.height / 2;
        this._updateShaders();
        this._context.viewport(0, 0, texture.width, texture.height);
    }

    return this;
};

/**
 * Set current transform
 * @param {uno.Matrix} [matrix] - The new matrix transform
 * @returns {uno.Matrix} - Current matrix transform
 */
uno.WebglRender.prototype.transform = function(matrix) {
    if (!matrix)
        return this._currentMatrix;
    this._currentMatrix.set(matrix);
    return this._currentMatrix;
};

/**
 * Set current blend mode
 * @param {Number} [mode] - The new blend mode. See {@link uno.Render} constants
 * @returns {Number} - Current blend mode
 */
uno.WebglRender.prototype.blendMode = function(mode) {
    if (!mode || !uno.WebglRender._blendModes[mode])
        return this._currentBlendMode;
    return this._currentBlendMode = mode;
};

/**
 * Set current fill color for rendering graphics shapes
 * @param {uno.Color} [color] - The new fill color
 * @returns {uno.Color} - Current fill color
 */
uno.WebglRender.prototype.fillColor = function(color) {
    return this._graphics.fillColor(color);
};

/**
 * Set current line color for rendering graphics shapes
 * @param {uno.Color} [color] - The new line color
 * @returns {uno.Color} - Current line color
 */
uno.WebglRender.prototype.lineColor = function(color) {
    return this._graphics.lineColor(color);
};

/**
 * Set current line width for rendering graphics shapes
 * @param {Number} [width] - The new line width
 * @returns {Number} - Current line width
 */
uno.WebglRender.prototype.lineWidth = function(width) {
    return this._graphics.lineWidth(width);
};

/**
 * Clear viewport with color
 * @param {uno.Color} [color] - Color to fill viewport. If undefined {@link uno.WebglRender.clearColor} used
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.clear = function(color) {
    // TODO: Actually we need reset method for graphics and batch (without rendering)
    this._graphics.flush();
    this._batch.flush();

    var ctx = this._context;

    if (this._transparent) {
        if (!color && this.clearColor === false)
            return;
        ctx.clearColor(0, 0, 0, 0);
        ctx.clear(ctx.COLOR_BUFFER_BIT);
        return this;
    }

    if (!color)
        color = this.clearColor;

    if (!color || !color.a)
        return this;

    ctx.clearColor(color.r, color.g, color.b, color.a);
    ctx.clear(ctx.COLOR_BUFFER_BIT);

    return this;
};

/**
 * Draw texture
 * @param {uno.Texture} texture - The texture to render
 * @param {uno.Rect} frame - The frame to render rect of the texture
 * @param {uno.Color} [tint=uno.Color.WHITE] - The texture tint color
 * @param {Number} [alpha=1] - Texture opacity
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawTexture = function(texture, frame, alpha, tint) {
    if (!texture.ready)
        return this;
    this._graphics.flush();
    this._batch.render(uno.WebglTexture.get(texture), frame ? frame.x : 0, frame ? frame.y : 0,
        frame ? frame.width : texture.width, frame ? frame.height : texture.height,
        alpha || 1, tint || uno.Color.WHITE);
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
    this._batch.flush();
    this._graphics.drawLine(x1, y1, x2, y2);
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
    this._batch.flush();
    this._graphics.drawRect(x, y, width, height);
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
    this._batch.flush();
    this._graphics.drawCircle(x, y, radius);
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
    this._batch.flush();
    this._graphics.drawEllipse(x, y, width, height);
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
    this._batch.flush();
    this._graphics.drawArc(x, y, radius, startAngle, endAngle, antiClockwise);
    return this;
};

/**
 * Draw polyline
 * @param {uno.Point[]} points - The points of the polyline
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawPoly = function(points) {
    this._batch.flush();
    this._graphics.drawPoly(points);
    return this;
};

/**
 * Draw previously created shape
 * @param {uno.Shape} shape - The shape created before
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.drawShape = function(shape) {
    this._batch.flush();
    this._graphics.drawShape(shape);
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
 * @returns {Uint8Array}
 */
uno.WebglRender.prototype.getPixels = function(texture) {
    if (this._target === texture) {
        this._batch.flush();
        this._graphics.flush();
    }
    return uno.WebglTexture.get(texture).getPixels(this);
};

/**
 * Set texture pixels
 * @param {uno.Texture} texture - The texture to process
 * @param {Uint8Array} data - Pixels data
 * @returns {uno.WebglRender} - <code>this</code>
 */
uno.WebglRender.prototype.setPixels = function(texture, data) {
    uno.WebglTexture.get(texture).setPixels(data, this);
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
    }.bind(this), restoreAfter | 1000);
    return true;
};

/**
 * Initialize settings properties helper
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
 * @private
 */
uno.WebglRender.prototype._setupSettings = function(settings) {
    var def = uno.Render.DEFAULT_SETTINGS;
    if (!settings.canvas)
        return uno.error('Can\'t create render, settings.canvas is not defined');
    this.clearColor = settings.clearColor ? settings.clearColor.clone() : def.clearColor.clone();
    this.fps = settings.fps === 0 ? 0 : (settings.fps || def.fps);
    this.ups = settings.ups === 0 ? 0 : (settings.ups || def.ups);
    this._canvas = settings.canvas;
    this._transparent = settings.transparent !== undefined ? !!settings.transparent : def.transparent;
    this._autoClear = settings.autoClear !== undefined ? !!settings.autoClear : def.autoClear;
    this._antialias = settings.antialias !== undefined ? !!settings.antialias : def.antialias;
    if (uno.Browser.ie) {
        this._canvas.style['-ms-content-zooming'] = 'none';
        this._canvas.style['-ms-touch-action'] = 'none';
    }
    if (!this._contextMenu)
        this._canvas.oncontextmenu = function() { return false; };
};

/**
 * Initialize render specific properties helper
 * @private
 */
uno.WebglRender.prototype._setupProps = function() {
    this._projection = new uno.Point();
    this._target = null;
    this._currentMatrix = new uno.Matrix();
    this._currentShader = null;
    this._targetMatrix = new uno.Matrix();
    this._shaders = {};
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
 * Initialize the render bounds tracking
 * @private
 */
uno.WebglRender.prototype._setupBounds = function() {
    this._bounds = new uno.Rect();
    this._boundsScroll = new uno.Point();
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
        alpha: this._transparent,
        premultipliedAlpha: this._transparent,
        antialias: this._antialias,
        stencil: false,
        preserveDrawingBuffer: !this.autoClear
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
    this._currentBlendMode = uno.Render.BLEND_NORMAL;
    this._applyBlendMode(this._currentBlendMode);
    this._restore();
    this._contextLost = false;
};

/**
 * Initialize viewport size
 * @param {Object} settings - See {@link uno.Render.DEFAULT_SETTINGS}
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
    uno.Render.renders[this.id] = this;
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
    this.blendMode(uno.Render.BLEND_NORMAL);
    this.transform(uno.Matrix.IDENTITY);
    var defaults = uno.Render.DEFAULT_GRAPHICS;
    this.fillColor(defaults.fillColor);
    this.lineColor(defaults.lineColor);
    this.lineWidth(defaults.lineWidth);
    if (this._autoClear)
        this.clear();
};

/**
 * Blend mode apply helper
 * @param {Number} blendMode - New blend mode
 * @private
 */
uno.WebglRender.prototype._applyBlendMode = function(blendMode) {
    if (this._applyedBlendMode === blendMode || !uno.WebglRender._blendModes)
        return;
    this._applyedBlendMode = blendMode;
    var mode = uno.WebglRender._blendModes[blendMode];
    if (!mode)
        return;
    this._context.blendFunc(mode[0], mode[1]);
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
    result[uno.Render.BLEND_NORMAL]     = [ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA];
    result[uno.Render.BLEND_ADD]        = [ctx.ONE, ctx.ONE];
    result[uno.Render.BLEND_MULTIPLY]   = [ctx.DST_COLOR, ctx.ONE_MINUS_SRC_ALPHA];
    result[uno.Render.BLEND_SCREEN]     = [ctx.ONE, ctx.ONE_MINUS_SRC_COLOR];
    uno.WebglRender._blendModes = result;
};
/**
 * Mouse event class
 * @constructor
 */
uno.MouseEvent = function() {
    /**
     * Type of event<br>
     *     Either: {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}, {@link uno.Mouse.WHEEL}
     * @type {Number}
     * @private
     */
    this._type = 0;

    /**
     * Current pressed mouse button<br>
     *     Either {@link uno.Mouse.NONE}, {@link uno.Mouse.LEFT}, {@link uno.Mouse.MIDDLE}, {@link uno.Mouse.RIGHT}
     * @type {Number}
     * @private
     */
    this._button = 0;

    /**
     * Current mouse pointer position (in global space, not in render space)
     * @type {uno.Point}
     * @private
     */
    this._position = new uno.Point(0, 0);

    /**
     * Current mouse wheel offset
     * @type {uno.Point}
     * @private
     */
    this._wheel = new uno.Point(0, 0);
};

/**
 * @memberof uno.MouseEvent
 * @member {Number} type - Type of event<br>
 *     Either: {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}, {@link uno.Mouse.WHEEL}
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'type', {
    get: function () {
        return this._type;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} button - Current pressed mouse button<br>
 *     Either {@link uno.Mouse.NONE}, {@link uno.Mouse.LEFT}, {@link uno.Mouse.MIDDLE}, {@link uno.Mouse.RIGHT}
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'button', {
    get: function () {
        return this._button;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} x - The x-coordinate of the mouse pointer in render space
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'x', {
    get: function () {
        return this._position.x;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} y - The y-coordinate of the mouse pointer in render space
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'y', {
    get: function () {
        return this._position.y;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} wheelX - The x offset of the mouse wheel
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'wheelX', {
    get: function () {
        return this._wheel.x;
    }
});

/**
 * @memberof uno.MouseEvent
 * @member {Number} wheelY - The y offset of the mouse wheel
 * @readonly
 */
Object.defineProperty(uno.MouseEvent.prototype, 'wheelY', {
    get: function () {
        return this._wheel.y;
    }
});

/**
 * Set event params
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}, {@link uno.Mouse.WHEEL}
 * @param {Number} x - The x-coordinate of the mouse pointer in render space
 * @param {Number} y - The y-coordinate of the mouse pointer in render space
 * @param {Number} button - Current pressed mouse button<br>
 *     Either {@link uno.Mouse.NONE}, {@link uno.Mouse.LEFT}, {@link uno.Mouse.MIDDLE}, {@link uno.Mouse.RIGHT}
 * @param {Number} wheelX - The x offset of the mouse wheel
 * @param {Number} wheelY - The y offset of the mouse wheel
 * @private
 */
uno.MouseEvent.prototype._set = function(type, button, x, y, wheelX, wheelY) {
    this._type = type;
    this._button = button;
    this._position.set(x, y);
    this._wheel.set(wheelX, wheelY);
};

/**
 * Reset event params
 * @private
 */
uno.MouseEvent.prototype._reset = function() {
    this._type = 0;
    this._button = 0;
    this._position.set(0, 0);
    this._wheel.set(0, 0);
};
/**
 * Mouse is responsible for handling all aspects of mouse interaction
 * @namespace
 */
uno.Mouse = function() {
    /**
     * @memberof uno.Mouse
     * @member {Number} _button - Current mouse button pressed
     * @private
     */
    this._button = 0;

    /**
     * @memberof uno.Mouse
     * @member {uno.Point} _position - Current mouse pointer position (in global space, not in render space)
     * @private
     */
    this._position = new uno.Point(0, 0);

    /**
     * @memberof uno.Mouse
     * @member {uno.Point} _wheel - Current mouse wheel offset
     * @private
     */
    this._wheel = new uno.Point(0, 0);

    /**
     * @memberof uno.Mouse
     * @member {uno.MouseEvent} _event - Event for dispatching
     * @private
     */
    this._event = new uno.MouseEvent();

    this._initialize();
};

/**
 * Check is event type equal to any of {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @param {Number} [button] - Current button pressed
 * @returns {Boolean}
 */
uno.Mouse.prototype.any = function(event, button) {
    return (event.type === uno.Mouse.UP || event.type === uno.Mouse.DOWN || event.type === uno.Mouse.MOVE) &&
        (!button || event.button === button);
};

/**
 * Check is event type is {@link uno.Mouse.UP}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @param {Number} [button] - Current button pressed
 * @returns {Boolean}
 */
uno.Mouse.prototype.up = function(event, button) {
    return event.type === uno.Mouse.UP && (!button || event.button === button);
};

/**
 * Check is event type is {@link uno.Mouse.DOWN}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @param {Number} [button] - Current button pressed
 * @returns {Boolean}
 */
uno.Mouse.prototype.down = function(event, button) {
    return event.type === uno.Mouse.DOWN && (!button || event.button === button);
};

/**
 * Check is event type is {@link uno.Mouse.MOVE}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @param {Number} [button] - Current button pressed
 * @returns {Boolean}
 */
uno.Mouse.prototype.move = function(event, button) {
    return event.type === uno.Mouse.MOVE && (!button || event.button === button);
};

/**
 * Check is event type is {@link uno.Mouse.WHEEL}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Mouse.prototype.wheel = function(event) {
    return event.type === uno.Mouse.WHEEL;
};

/**
 * @memberof uno.Mouse
 * @member {Number} button - Current pressed mouse button<br>
 * Either uno.Mouse.NONE, uno.Mouse.LEFT, uno.Mouse.MIDDLE, uno.Mouse.RIGHT
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'button', {
    get: function () {
        return this._button;
    }
});

/**
 * @memberof uno.Mouse
 * @member {Number} x - The x-coordinate of the mouse pointer (in global space, not in render space)
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'x', {
    get: function () {
        return this._position.x;
    }
});

/**
 * @memberof uno.Mouse
 * @member {Number} y - The y-coordinate of the mouse pointer (in global space, not in render space)
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'y', {
    get: function () {
        return this._position.y;
    }
});

/**
 * @memberof uno.Mouse
 * @member {Number} wheelX - The x-offset of the mouse wheel
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'wheelX', {
    get: function () {
        return this._wheel.x;
    }
});

/**
 * @memberof uno.Mouse
 * @member {Number} wheelY - The y-offset of the mouse wheel
 * @readonly
 */
Object.defineProperty(uno.Mouse.prototype, 'wheelY', {
    get: function () {
        return this._wheel.y;
    }
});

/**
 * Initialize mouse events
 * @private
 */
uno.Mouse.prototype._initialize = function() {
    if (uno.Browser.any) {
        window.addEventListener('mouseover', this._onOver.bind(this), true);
        window.addEventListener('mouseout', this._onOut.bind(this), true);
        window.addEventListener('mouseup', this._onUp.bind(this), true);
        window.addEventListener('mousedown', this._onDown.bind(this), true);
        window.addEventListener('mousemove', this._onMove.bind(this), true);

        // DOM3 Wheel Event: FF 17+, IE 9+, Chrome 31+, Safari 7+
        if ('onwheel' in window || (uno.Browser.ie && 'WheelEvent' in window))
            window.addEventListener('wheel', this._onWheel.bind(this), true);
        // Non-FF legacy: IE 6-9, Chrome 1-31, Safari 5-7.
        else if ('onmousewheel' in window)
            window.addEventListener('mousewheel', this._onWheel.bind(this), true);
        // FF prior to 17
        else if (uno.Browser.firefox && 'MouseScrollEvent' in window)
            window.addEventListener('MozMousePixelScroll', this._onWheel.bind(this), true);
    }
};

/**
 * Call input handler for all renders root objects
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Mouse.UP}, {@link uno.Mouse.DOWN}, {@link uno.Mouse.MOVE}, {@link uno.Mouse.WHEEL}
 * @private
 */
uno.Mouse.prototype._callInput = function(type) {
    var renders = uno.Render.renders;
    var event = this._event;
    var prevent = false;
    for (var i in renders) {
        var render = renders[i];
        var bounds = render.bounds();
        var pointer = this._position;
        if (render.root && bounds.contains(pointer)) {
            event._set(type, this._button, pointer.x - bounds.x, pointer.y - bounds.y, this._wheel.x, this._wheel.y);
            render.root.input(event, render);
            prevent = true;
        }
    }
    event._reset();
    return prevent;
};

/**
 * Mouse over callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onOver = function(e) {
    this._position.set(e.clientX, e.clientY);
};

/**
 * Mouse out callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onOut = function() {
    this._position.set(0, 0);
};

/**
 * Mouse down callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onDown = function(e) {
    this._position.set(e.clientX, e.clientY);
    this._button = Math.min(e.button + 1, 3);
    if (this._callInput(uno.Mouse.DOWN))
        e.preventDefault();
};

/**
 * Mouse up callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onUp = function(e) {
    this._position.set(e.clientX, e.clientY);
    this._button = Math.min(e.button + 1, 3);
    if (this._callInput(uno.Mouse.UP))
        e.preventDefault();
    this._button = uno.Mouse.NONE;
};

/**
 * Mouse move callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onMove = function(e) {
    this._position.set(e.clientX, e.clientY);
    if (this._callInput(uno.Mouse.MOVE))
        e.preventDefault();
};

/**
 * Mouse wheel callback
 * @param {MouseEvent} e - Mouse event
 * @private
 */
uno.Mouse.prototype._onWheel = function(e) {
    if (e.deltaX !== undefined)
        this._wheel.set(e.deltaX, e.deltaY);
    else if (e.wheelDeltaX !== undefined)
        this._wheel.set(e.wheelDeltaX, e.wheelDeltaY);
    else
        this._wheel.set(0, e.detail);
    if (this._callInput(uno.Mouse.WHEEL))
        e.preventDefault();
};

uno.Mouse = new uno.Mouse();

/**
 * No mouse button
 * @const
 * @type {Number}
 */
uno.Mouse.NONE = 0;

/**
 * Left mouse button
 * @const
 * @type {Number}
 */
uno.Mouse.LEFT = 1;

/**
 * Middle mouse button
 * @const
 * @type {Number}
 */
uno.Mouse.MIDDLE = 2;

/**
 * Right mouse button
 * @const
 * @type {Number}
 */
uno.Mouse.RIGHT = 3;

/**
 * Mouse up event type
 * @const
 * @type {Number}
 */
uno.Mouse.UP = 100;

/**
 * Mouse down event type
 * @const
 * @type {Number}
 */
uno.Mouse.DOWN = 101;

/**
 * Mouse move event type
 * @const
 * @type {Number}
 */
uno.Mouse.MOVE = 102;


/**
 * Mouse wheel event type
 * @const
 * @type {Number}
 */
uno.Mouse.WHEEL = 103;
/**
 * Keyboard event class
 * @constructor
 */
uno.KeyboardEvent = function() {
    /**
     * Type of event<br>
     *     Either: {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
     * @type {Number}
     * @private
     */
    this._type = 0;

    /**
     * Keyboard button key code
     * @type {Number}
     * @private
     */
    this._key = 0;

    /**
     * Char code of the keyboard button
     * @type {Number}
     * @private
     */
    this._char = 0;

    /**
     * Is ALT keyboard button pressed
     * @type {Boolean}
     * @private
     */
    this._alt = false;

    /**
     * Is CONTROL keyboard button pressed
     * @type {Boolean}
     * @private
     */
    this._control = false;

    /**
     * Is SHIFT keyboard button pressed
     * @type {Boolean}
     * @private
     */
    this._shift = false;

    /**
     * Is COMMAND keyboard button pressed
     * @type {Boolean}
     * @private
     */
    this._command = false;
};

/**
 * Type of event<br>
 *     Either: {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
 * @name uno.KeyboardEvent#type
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'type', {
    get: function () {
        return this._type;
    }
});

/**
 * Keyboard button key code
 * @name uno.KeyboardEvent#key
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'key', {
    get: function () {
        return this._key;
    }
});

/**
 * Char code of the keyboard button
 * @name uno.KeyboardEvent#char
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'char', {
    get: function () {
        return this._char;
    }
});

/**
 * Is ALT keyboard button pressed
 * @name uno.KeyboardEvent#alt
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'alt', {
    get: function () {
        return this._alt;
    }
});

/**
 * Is CONTROL keyboard button pressed
 * @name uno.KeyboardEvent#control
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'control', {
    get: function () {
        return this._control;
    }
});

/**
 * Is SHIFT keyboard button pressed
 * @name uno.KeyboardEvent#shift
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'shift', {
    get: function () {
        return this._shift;
    }
});

/**
 * Is COMMAND keyboard button pressed
 * @name uno.KeyboardEvent#command
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'command', {
    get: function () {
        return this._command;
    }
});

/**
 * Set event params
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
 * @param {Number} key - Keyboard button key code
 * @param {Number} char - Char code of the keyboard button
 * @param {Boolean} alt - Is ALT keyboard button pressed
 * @param {Boolean} control - Is CONTROL keyboard button pressed
 * @param {Boolean} shift - Is SHIFT keyboard button pressed
 * @param {Boolean} command - Is COMMAND keyboard button pressed
 * @private
 */
uno.KeyboardEvent.prototype._set = function(type, key, char, alt, control, shift, command) {
    this._type = type;
    this._key = key;
    this._char = char;
    this._alt = alt;
    this._control = control;
    this._shift = shift;
    this._command = command;
};

/**
 * Reset event params
 * @private
 */
uno.KeyboardEvent.prototype._reset = function() {
    this._type = 0;
    this._key = 0;
    this._char = 0;
    this._alt = false;
    this._control = false;
    this._shift = false;
    this._command = false;
};
/**
 * Keyboard is responsible for handling all aspects of keyboard interaction
 * @namespace
 */
uno.Keyboard = function() {
    /**
     * @memberof uno.Keyboard
     * @member {Object} _keys - Keyboard buttons key down states (true/false)
     * @private
     */
    this._keys = {};

    /**
     * @memberof uno.Keyboard
     * @member {Boolean} _control - Is CONTROL button pressed
     * @private
     */
    this._control = false;

    /**
     * @memberof uno.Keyboard
     * @member {Boolean} _alt - Is ALT button pressed
     * @private
     */
    this._alt = false;

    /**
     * @memberof uno.Keyboard
     * @member {Boolean} _shift - Is SHIFT button pressed
     * @private
     */
    this._shift = false;

    /**
     * @memberof uno.Keyboard
     * @member {Boolean} _command - Is COMMAND button pressed
     * @private
     */
    this._command = false;

    /**
     * @memberof uno.Keyboard
     * @member {Object} _controls - Control key codes list
     * @private
     */
    this._controls = {};

    /**
     * @memberof uno.Keyboard
     * @member {Number} _lastKey - Last key code
     * @private
     */
    this._lastKey = 0;

    /**
     * @memberof uno.Keyboard
     * @member {Number} _lastChar - Last key char
     * @private
     */
    this._lastChar = 0;

    /**
     * @memberof uno.Keyboard
     * @member {uno.Keyboard} _event - Event for dispatching
     * @private
     */
    this._event = new uno.KeyboardEvent();

    this._initialize();
};

/**
 * Check is event type equal to any of {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @static
 * @returns {Boolean}
 */
uno.Keyboard.prototype.any = function(event) {
    return event.type === uno.Keyboard.UP || event.type === uno.Keyboard.DOWN;
};

/**
 * Check is event type is {@link uno.Keyboard.UP}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @static
 * @returns {Boolean}
 */
uno.Keyboard.prototype.up = function(event) {
    return event.type === uno.Keyboard.UP;
};

/**
 * Check is event type is {@link uno.Keyboard.DOWN}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @static
 * @returns {Boolean}
 */
uno.Keyboard.prototype.down = function(event) {
    return event.type === uno.Keyboard.DOWN;
};

/**
 * Is keyboard button with code pressed
 * @param {Number} key - The key code of the button
 * @returns {Boolean}
 */
uno.Keyboard.prototype.key = function(key) {
    return this._keys[key];
};

/**
 * @memberof uno.Keyboard
 * @member {Boolean} control - Is CONTROL button pressed
 * @readonly
 */
Object.defineProperty(uno.Keyboard.prototype, 'control', {
    get: function () {
        return this._control;
    }
});

/**
 * @memberof uno.Keyboard
 * @member {Boolean} alt - Is ALT button pressed
 * @readonly
 */
Object.defineProperty(uno.Keyboard.prototype, 'alt', {
    get: function () {
        return this._alt;
    }
});

/**
 * @memberof uno.Keyboard
 * @member {Boolean} shift - Is SHIFT button pressed
 * @readonly
 */
Object.defineProperty(uno.Keyboard.prototype, 'shift', {
    get: function () {
        return this._shift;
    }
});

/**
 * @memberof uno.Keyboard
 * @member {Boolean} command - Is COMMAND button pressed
 * @readonly
 */
Object.defineProperty(uno.Keyboard.prototype, 'command', {
    get: function () {
        return this._command;
    }
});

/**
 * Initialize mouse events
 * @private
 */
uno.Keyboard.prototype._initialize = function() {
    var items = [
        33, 34, 35, 36, 37, 38, 39, 40, // Page up, Page down, End, Home, Left, Up, Right, Down
        45, 46, 47, // Insert, Delete, Help
        112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, // F1 - F15
        8, 9, 12, 16, 17, 18, 20, 27,   // Backspace, Tab, Clear, Shift, Control, Alt, Caps lock, Esc
        91, 93,  // Command left, Command right
        144    // Num lock
    ];

    for (var i = 0, l = items.length; i < l; ++i)
        this._controls[items[i]] = true;

    if (uno.Browser.any) {
        window.addEventListener('keydown', this._onDown.bind(this), true);
        window.addEventListener('keyup', this._onUp.bind(this), true);
        window.addEventListener('keypress', this._onPress.bind(this), true);
    }
};

/**
 * Call input handler for all renders root objects
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
 * @param {Number} key - Key code
 * @param {Number} char - Char code
 * @private
 */
uno.Keyboard.prototype._callInput = function(type, key, char) {
    var renders = uno.Render.renders;
    var event = this._event;
    event._set(type, key, char, this._alt, this._control, this._shift, this._command);
    for (var i in renders) {
        var render = renders[i];
        if (render.root)
            render.root.input(event, render);
    }
    event._reset();
};

/**
 * Keyboard over callback
 * @param {KeyboardEvent} e - Keyboard event
 * @private
 */
uno.Keyboard.prototype._onDown = function(e) {
    var key = e.which || e.keyCode;
    this._keys[key] = true;
    if (this._controls[key]) {
        this._lastChar = 0;
        this._callInput(uno.Keyboard.DOWN, key, this._lastChar);
        uno.log('Press key:', key, 'char:', this._lastChar);
    } else
        this._lastKey = key;
};

/**
 * Keyboard down callback
 * @param {KeyboardEvent} e - Keyboard event
 * @private
 */
uno.Keyboard.prototype._onPress = function(e) {
    this._lastChar = e.charCode;
    this._callInput(uno.Keyboard.DOWN, this._lastKey, this._lastChar);
    uno.log('Press key:', this._lastKey, 'char:', this._lastChar);
};

/**
 * Keyboard out callback
 * @param {KeyboardEvent} e - Keyboard event
 * @private
 */
uno.Keyboard.prototype._onUp = function(e) {
    var key = e.which || e.keyCode;
    this._keys[key] = false;
    this._callInput(uno.Keyboard.UP, key, this._lastChar);
    uno.log('Up key:', key, 'char:', this._lastChar);
};

uno.Keyboard = new uno.Keyboard();

/**
 * Keyboard up event type
 * @const
 * @type {Number}
 */
uno.Keyboard.UP = 200;

/**
 * Mouse down event type
 * @const
 * @type {Number}
 */
uno.Keyboard.DOWN = 201;

/**
 * Key constants
 * @readonly
 * @property {Number} A - 'A' button key code
 * @property {Number} B - 'B' button key code
 * @property {Number} C - 'C' button key code
 * @property {Number} D - 'D' button key code
 * @property {Number} E - 'E' button key code
 * @property {Number} F - 'F' button key code
 * @property {Number} G - 'G' button key code
 * @property {Number} H - 'H' button key code
 * @property {Number} I - 'I' button key code
 * @property {Number} J - 'J' button key code
 * @property {Number} K - 'K' button key code
 * @property {Number} L - 'L' button key code
 * @property {Number} M - 'M' button key code
 * @property {Number} N - 'N' button key code
 * @property {Number} O - 'O' button key code
 * @property {Number} P - 'P' button key code
 * @property {Number} Q - 'Q' button key code
 * @property {Number} R - 'R' button key code
 * @property {Number} S - 'S' button key code
 * @property {Number} T - 'T' button key code
 * @property {Number} U - 'U' button key code
 * @property {Number} V - 'V' button key code
 * @property {Number} W - 'W' button key code
 * @property {Number} X - 'X' button key code
 * @property {Number} Y - 'Y' button key code
 * @property {Number} Z - 'Z' button key code
 * @property {Number} ZERO - '0' button key code
 * @property {Number} ONE - '1' button key code
 * @property {Number} TWO - '2' button key code
 * @property {Number} THREE - '3' button key code
 * @property {Number} FOUR - '4' button key code
 * @property {Number} FIVE - '5' button key code
 * @property {Number} SIX - '6' button key code
 * @property {Number} SEVEN - '7' button key code
 * @property {Number} EIGHT - '8' button key code
 * @property {Number} NINE - '9' button key code
 * @property {Number} NUMPAD_0 - '0' numpad button key code
 * @property {Number} NUMPAD_1 - '1' numpad button key code
 * @property {Number} NUMPAD_2 - '2' numpad button key code
 * @property {Number} NUMPAD_3 - '3' numpad button key code
 * @property {Number} NUMPAD_4 - '4' numpad button key code
 * @property {Number} NUMPAD_5 - '5' numpad button key code
 * @property {Number} NUMPAD_6 - '6' numpad button key code
 * @property {Number} NUMPAD_7 - '7' numpad button key code
 * @property {Number} NUMPAD_8 - '8' numpad button key code
 * @property {Number} NUMPAD_9 - '9' numpad button key code
 * @property {Number} NUMPAD_MULTUPLY - '*' numpad button key code
 * @property {Number} NUMPAD_ADD - '+' numpad button key code
 * @property {Number} NUMPAD_ENTER - 'Enter' numpad button key code
 * @property {Number} NUMPAD_SUBTRACT - '-' numpad button key code
 * @property {Number} NUMPAD_DECIMAL - '.' numpad button key code
 * @property {Number} NUMPAD_DIVIDE - '/' numpad button key code
 * @property {Number} F1 - 'F1' button key code
 * @property {Number} F2 - 'F2' button key code
 * @property {Number} F3 - 'F3' button key code
 * @property {Number} F4 - 'F4' button key code
 * @property {Number} F5 - 'F5' button key code
 * @property {Number} F6 - 'F6' button key code
 * @property {Number} F7 - 'F7' button key code
 * @property {Number} F8 - 'F8' button key code
 * @property {Number} F9 - 'F9' button key code
 * @property {Number} F10 - 'F10' button key code
 * @property {Number} F11 - 'F11' button key code
 * @property {Number} F12 - 'F12' button key code
 * @property {Number} F13 - 'F13' button key code
 * @property {Number} F14 - 'F14' button key code
 * @property {Number} F15 - 'F15' button key code
 * @property {Number} COLON - ';' button key code
 * @property {Number} UNDERSCORE - '_' button key code
 * @property {Number} QUESTION_MARK - '?' button key code
 * @property {Number} TILDE - '~' button key code
 * @property {Number} OPEN_BRACKET - '[' button key code
 * @property {Number} BACKWARD_SLASH - '/' button key code
 * @property {Number} CLOSED_BRACKET - ']' button key code
 * @property {Number} QUOTES - ''' button key code
 * @property {Number} BACKSPACE - 'Back Space' button key code
 * @property {Number} TAB - 'Tab' button key code
 * @property {Number} CLEAR - 'Clear' button key code
 * @property {Number} ENTER - 'Enter' button key code
 * @property {Number} SHIFT - 'Shift' button key code
 * @property {Number} CONTROL - 'Control' button key code
 * @property {Number} ALT - 'Alt' button key code
 * @property {Number} CAPS_LOCK - 'Caps Lock' button key code
 * @property {Number} ESC - 'Esc' button key code
 * @property {Number} SPACEBAR - 'Space Bar' button key code
 * @property {Number} PAGE_UP - 'Page Up' button key code
 * @property {Number} PAGE_DOWN - 'Page Down' button key code
 * @property {Number} END - 'End' button key code
 * @property {Number} HOME - 'Home' button key code
 * @property {Number} ARROW_LEFT - 'Left' button key code
 * @property {Number} ARROW_UP - 'Up' button key code
 * @property {Number} ARROW_RIGHT - 'Right' button key code
 * @property {Number} ARROW_DOWN - 'Down' button key code
 * @property {Number} INSERT - 'Insert' button key code
 * @property {Number} DELETE - 'Delete' button key code
 * @property {Number} HELP - 'Help' button key code
 * @property {Number} NUM_LOCK - 'Num Lock' button key code
 * @property {Number} PLUS - '+' button key code
 * @property {Number} MINUS - '-' button key code
 */
uno.Keyboard.A = 'A'.charCodeAt(0);
uno.Keyboard.B = 'B'.charCodeAt(0);
uno.Keyboard.C = 'C'.charCodeAt(0);
uno.Keyboard.D = 'D'.charCodeAt(0);
uno.Keyboard.E = 'E'.charCodeAt(0);
uno.Keyboard.F = 'F'.charCodeAt(0);
uno.Keyboard.G = 'G'.charCodeAt(0);
uno.Keyboard.H = 'H'.charCodeAt(0);
uno.Keyboard.I = 'I'.charCodeAt(0);
uno.Keyboard.J = 'J'.charCodeAt(0);
uno.Keyboard.K = 'K'.charCodeAt(0);
uno.Keyboard.L = 'L'.charCodeAt(0);
uno.Keyboard.M = 'M'.charCodeAt(0);
uno.Keyboard.N = 'N'.charCodeAt(0);
uno.Keyboard.O = 'O'.charCodeAt(0);
uno.Keyboard.P = 'P'.charCodeAt(0);
uno.Keyboard.Q = 'Q'.charCodeAt(0);
uno.Keyboard.R = 'R'.charCodeAt(0);
uno.Keyboard.S = 'S'.charCodeAt(0);
uno.Keyboard.T = 'T'.charCodeAt(0);
uno.Keyboard.U = 'U'.charCodeAt(0);
uno.Keyboard.V = 'V'.charCodeAt(0);
uno.Keyboard.W = 'W'.charCodeAt(0);
uno.Keyboard.X = 'X'.charCodeAt(0);
uno.Keyboard.Y = 'Y'.charCodeAt(0);
uno.Keyboard.Z = 'Z'.charCodeAt(0);
uno.Keyboard.ZERO = '0'.charCodeAt(0);
uno.Keyboard.ONE = '1'.charCodeAt(0);
uno.Keyboard.TWO = '2'.charCodeAt(0);
uno.Keyboard.THREE = '3'.charCodeAt(0);
uno.Keyboard.FOUR = '4'.charCodeAt(0);
uno.Keyboard.FIVE = '5'.charCodeAt(0);
uno.Keyboard.SIX = '6'.charCodeAt(0);
uno.Keyboard.SEVEN = '7'.charCodeAt(0);
uno.Keyboard.EIGHT = '8'.charCodeAt(0);
uno.Keyboard.NINE = '9'.charCodeAt(0);
uno.Keyboard.NUMPAD_0 = 96;
uno.Keyboard.NUMPAD_1 = 97;
uno.Keyboard.NUMPAD_2 = 98;
uno.Keyboard.NUMPAD_3 = 99;
uno.Keyboard.NUMPAD_4 = 100;
uno.Keyboard.NUMPAD_5 = 101;
uno.Keyboard.NUMPAD_6 = 102;
uno.Keyboard.NUMPAD_7 = 103;
uno.Keyboard.NUMPAD_8 = 104;
uno.Keyboard.NUMPAD_9 = 105;
uno.Keyboard.NUMPAD_MULTIPLY = 106;
uno.Keyboard.NUMPAD_ADD = 107;
uno.Keyboard.NUMPAD_ENTER = 108;
uno.Keyboard.NUMPAD_SUBTRACT = 109;
uno.Keyboard.NUMPAD_DECIMAL = 110;
uno.Keyboard.NUMPAD_DIVIDE = 111;
uno.Keyboard.F1 = 112;
uno.Keyboard.F2 = 113;
uno.Keyboard.F3 = 114;
uno.Keyboard.F4 = 115;
uno.Keyboard.F5 = 116;
uno.Keyboard.F6 = 117;
uno.Keyboard.F7 = 118;
uno.Keyboard.F8 = 119;
uno.Keyboard.F9 = 120;
uno.Keyboard.F10 = 121;
uno.Keyboard.F11 = 122;
uno.Keyboard.F12 = 123;
uno.Keyboard.F13 = 124;
uno.Keyboard.F14 = 125;
uno.Keyboard.F15 = 126;
uno.Keyboard.COLON = 186;
uno.Keyboard.EQUALS = 187;
uno.Keyboard.UNDERSCORE = 189;
uno.Keyboard.QUESTION_MARK = 191;
uno.Keyboard.TILDE = 192;
uno.Keyboard.OPEN_BRACKET = 219;
uno.Keyboard.BACKWARD_SLASH = 220;
uno.Keyboard.CLOSED_BRACKET = 221;
uno.Keyboard.QUOTES = 222;
uno.Keyboard.BACKSPACE = 8;
uno.Keyboard.TAB = 9;
uno.Keyboard.CLEAR = 12;
uno.Keyboard.ENTER = 13;
uno.Keyboard.SHIFT = 16;
uno.Keyboard.CONTROL = 17;
uno.Keyboard.ALT = 18;
uno.Keyboard.CAPS_LOCK = 20;
uno.Keyboard.ESC = 27;
uno.Keyboard.SPACEBAR = 32;
uno.Keyboard.PAGE_UP = 33;
uno.Keyboard.PAGE_DOWN = 34;
uno.Keyboard.END = 35;
uno.Keyboard.HOME = 36;
uno.Keyboard.ARROW_LEFT = 37;
uno.Keyboard.ARROW_UP = 38;
uno.Keyboard.ARROW_RIGHT = 39;
uno.Keyboard.ARROW_DOWN = 40;
uno.Keyboard.INSERT = 45;
uno.Keyboard.DELETE = 46;
uno.Keyboard.HELP = 47;
uno.Keyboard.NUM_LOCK = 144;
uno.Keyboard.PLUS = 43;
uno.Keyboard.MINUS = 45;
/**
 * Touch point class
 * @constructor
 */
uno.TouchPoint = function() {
    /**
     * Touch point identifier
     * @type {number}
     * @private
     */
    this._id = 0;

    /**
     * Touch point position
     * @type {uno.Point}
     * @private
     */
    this._position = new uno.Point(0, 0);

    // TODO: Add additional touch info
};

/**
 * Identifier of the touch point
 * @name uno.TouchPoint#id
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchPoint.prototype, 'id', {
    get: function () {
        return this._id;
    }
});

/**
 * The x-coordinate of the touch position
 * @name uno.TouchPoint#x
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchPoint.prototype, 'x', {
    get: function () {
        return this._position.x;
    }
});

/**
 * The y-coordinate of the touch position
 * @name uno.TouchPoint#y
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchPoint.prototype, 'y', {
    get: function () {
        return this._position.y;
    }
});

/**
 * Set touch point
 * @param {Number} id - Identifier of the touch point
 * @param {Number} x - The x-coordinate of the touch position
 * @param {Number} y - The y-coordinate of the touch position
 * @private
 */
uno.TouchPoint.prototype._set = function(id, x, y) {
    this._id = id;
    this._position.set(x, y);
};

/**
 * Reset touch point
 * @private
 */
uno.TouchPoint.prototype._reset = function() {
    this._id = 0;
    this._position.set(0, 0);
};
/**
 * Touch list class
 * @constructor
 */
uno.TouchList = function() {
    /**
     * List of touch points
     * @type {uno.TouchPoint[]}
     * @private
     */
    this._points = [];

    /**
     * Pool for touch points
     * @type {Array}
     * @private
     */
    this._pool = [];
};

/**
 * Count of touch points
 * @name uno.TouchList#length
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchList.prototype, 'length', {
    get: function () {
        return this._points.length;
    }
});

/**
 * Get touch point by index
 * @param {Number} index - Index of the touch point
 * @returns {uno.TouchPoint}
 */
uno.TouchList.prototype.item = function(index) {
    if (index === undefined)
        index = 0;
    if (index >= 0 && index < this._points.length)
        return this._points[index];
    return undefined;
};

/**
 * Resize touch points list before update
 * @param {Number} length - New length of the list
 * @private
 */
uno.TouchList.prototype._resize = function(length) {
    var points = this._points;
    var pool = this._pool;
    var i;
    if (points.length === length)
        return;
    if (length < points.length) {
        i = length === 0 ? points.length : points.length - length;
        var returned = points.splice(0, i);
        while (i--)
            pool.push(returned[i]);
        return;
    }
    i = length - points.length;
    while (i--) {
        if (pool.length)
            points.push(pool.pop());
        else
            points.push(new uno.TouchPoint());
    }
};
/**
 * Touch event class
 * @constructor
 */
uno.TouchEvent = function() {
    /**
     * Type of event<br>
     *     Either: {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
     * @type {Number}
     * @private
     */
    this._type = 0;

    /**
     * Current touch points (positions in render space)
     * @type {uno.TouchList}
     * @private
     */
    this._points = new uno.TouchList();
};

/**
 * Type of event<br>
 *     Either: {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
 * @name uno.TouchEvent#type
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.TouchEvent.prototype, 'type', {
    get: function () {
        return this._type;
    }
});

/**
 * List of touch points
 * @name uno.TouchEvent#points
 * @type {uno.TouchList}
 * @readonly
 */
Object.defineProperty(uno.TouchEvent.prototype, 'points', {
    get: function () {
        return this._points;
    }
});

/**
 * Set event
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
 * @param {uno.Rect} bounds - Render bounds for calc coordinates in render space
 * @param {uno.TouchList} points - Touch point list
 * @private
 */
uno.TouchEvent.prototype._set = function(type, bounds, points) {
    this._type = type;
    var localPoints = this._points;
    var item, j = 0;
    localPoints._resize(points.length);
    for (var i = 0, l = points.length; i < l; ++i) {
        item = points.item(i);
        if (bounds.contains(item))
            localPoints.item(i - j)._set(item.id, item.x - bounds.x, item.y - bounds.y);
        else
            j++;
    }
    if (j)
        localPoints._resize(localPoints.length - j);
};

/**
 * Reset touch event params
 * @private
 */
uno.TouchEvent.prototype._reset = function() {
    this._type = 0;
    this._points._resize(0);
};
/**
 * Touch is responsible for handling all aspects of touch interaction
 * @namespace
 */
uno.Touch = function() {
    /**
     * @memberof uno.Touch
     * @member {uno.TouchList} _points - Current touch points (positions in global space, not in render space)
     * @private
     */
    this._points = new uno.TouchList();

    /**
     * @memberof uno.Touch
     * @member {uno.TouchEvent} _event - Event for dispatching
     * @private
     */
    this._event = new uno.TouchEvent();

    this._initialize();
};

/**
 * Check is event type equal to any of {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Touch.prototype.any = function(event) {
    return event.type === uno.Touch.UP || event.type === uno.Touch.DOWN || event.type === uno.Touch.MOVE;
};

/**
 * Check is event type is {@link uno.Touch.UP}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Touch.prototype.up = function(event) {
    return event.type === uno.Touch.UP;
};

/**
 * Check is event type is {@link uno.Touch.DOWN}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Touch.prototype.down = function(event) {
    return event.type === uno.Touch.DOWN;
};

/**
 * Check is event type is {@link uno.Touch.MOVE}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @returns {Boolean}
 */
uno.Touch.prototype.move = function(event) {
    return event.type === uno.Touch.MOVE;
};

/**
 * Initialize touch events
 * @private
 */
uno.Touch.prototype._initialize = function() {
    if (uno.Browser.any) {
        if ('ontouchstart' in document.documentElement) {
            window.addEventListener('touchstart', this._onTouchStart.bind(this), true);
            window.addEventListener('touchend', this._onTouchEnd.bind(this), true);
            window.addEventListener('touchmove', this._onTouchMove.bind(this), true);
            window.addEventListener('touchleave', this._onTouchLeave.bind(this), true);
            window.addEventListener('touchcancel', this._onTouchCancel.bind(this), true);
        } else
        // For IE 11
        if (window.PointerEvent) {
            window.addEventListener('pointerdown', this._onPointerDown.bind(this), true);
            window.addEventListener('pointermove', this._onPointerMove.bind(this), true);
            window.addEventListener('pointerup', this._onPointerUp.bind(this), true);
        } else
        // For IE 10
        if (window.MSPointerEvent) {
            window.addEventListener('MSPointerDown', this._onPointerDown.bind(this), true);
            window.addEventListener('MSPointerMove', this._onPointerMove.bind(this), true);
            window.addEventListener('MSPointerUp', this._onPointerUp.bind(this), true);
        }
    }
};

/**
 * Update touch points
 * @param {TouchEvent} e - Event to process
 * @private
 */
uno.Touch.prototype._updateTouch = function(e) {
    var touches = e.touches;
    var points = this._points;
    var item;
    points._resize(touches.length);
    for (var i = 0, l = touches.length; i < l; ++i) {
        item = touches.item(i);
        points.item(i)._set(item.identifier, item.clientX, item.clientY);
    }
};

/**
 * Call input handler for all renders root objects
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Touch.UP}, {@link uno.Touch.DOWN}, {@link uno.Touch.MOVE}
 * @private
 */
uno.Touch.prototype._callInput = function(type) {
    var renders = uno.Render.renders;
    var event = this._event;
    var prevent = false;
    for (var i in renders) {
        var render = renders[i];
        if (!render.root)
            continue;
        event._set(type, render.bounds(), this._points);
        if (event.points.length) {
            render.root.input(event, render);
            prevent = true;
        }
    }
    event._reset();
    return prevent;
};

/**
 * Pointer down callback
 * @param {PointerEvent} e - Pointer event
 * @private
 */
uno.Touch.prototype._onPointerDown = function(e) {
    if (e.pointerType !== undefined && e.pointerType !== 'touch')
        return;
    var points = this._points;
    points._resize(points.length + 1);
    points.item(points.length - 1)._set(e.pointerId, e.clientX, e.clientY);
    if (this._callInput(uno.Touch.DOWN))
        e.preventDefault();
};

/**
 * Pointer up callback
 * @param {PointerEvent} e - Pointer event
 * @private
 */
uno.Touch.prototype._onPointerUp = function(e) {
    if (e.pointerType !== undefined && e.pointerType !== 'touch')
        return;
    var points = this._points;
    for (var i = 0, l = points.length - 1; i < l; ++i) {
        var point = points.item(i);
        points.item(i)._set(point.id, point.x, point.y);
    }
    points._resize(points.length - 1);
    if (this._callInput(uno.Touch.UP))
        e.preventDefault();
};

/**
 * Pointer move callback
 * @param {PointerEvent} e - Pointer event
 * @private
 */
uno.Touch.prototype._onPointerMove = function(e) {
    if (e.pointerType !== undefined && e.pointerType !== 'touch')
        return;
    var points = this._points;
    for (var i = 0, l = points.length; i < l; ++i) {
        var point = points.item(i);
        if (point.id === e.pointerId) {
            point._set(point.id, e.clientX, e.clientY);
            break;
        }
    }
    if (this._callInput(uno.Touch.MOVE))
        e.preventDefault();
};

/**
 * Touch start callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchStart = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.DOWN))
        e.preventDefault();
};

/**
 * Touch end callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchEnd = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.UP))
        e.preventDefault();
};

/**
 * Touch move callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchMove = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.MOVE))
        e.preventDefault();
};

/**
 * Touch leave callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchLeave = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.UP))
        e.preventDefault();
};

/**
 * Touch cancel callback
 * @param {TouchEvent} e - Touch event
 * @private
 */
uno.Touch.prototype._onTouchCancel = function(e) {
    this._updateTouch(e);
    if (this._callInput(uno.Touch.UP))
        e.preventDefault();
};

uno.Touch = new uno.Touch();

/**
 * Touch up event type
 * @const
 * @type {Number}
 */
uno.Touch.UP = 300;

/**
 * Touch down event type
 * @const
 * @type {Number}
 */
uno.Touch.DOWN = 301;

/**
 * Touch move event type
 * @const
 * @type {Number}
 */
uno.Touch.MOVE = 302;
/**
 * Scene object
 * @constructor
 */
uno.Object = function() {
    /**
     * Object parent. If null there is no parent
     * @type {uno.Object}
     * @default null
     * @private
     */
    this._parent = null;
};

/**
 * Object parent. If null there is no parent
 * @name uno.Object#parent
 * @type {uno.Object}
 */
Object.defineProperty(uno.Object.prototype, 'parent', {
    get: function () {
        return this._parent;
    },
    set: function(value) {
        if (this._parent === value)
            return;
        this.removeSelf();
        value.addChild(this);
    }
});

/**
 * Children count
 * @name uno.Object#length
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.Object.prototype, 'length', {
    get: function () {
        return this._children ? this._children.length : 0;
    }
});

/**
 * Add child object
 * @param {uno.Object} child - Child to add
 * @param {Number} index - Where to add object
 * @returns {uno.Object}
 */
uno.Object.prototype.addChild = function(child, index) {
    if (!this._children)
        this._children = [];
    var children = this._children;
    index = index | children.length;
    if (index < 0 || index > children.length)
        return uno.error('The index [', index, '] out of bounds');
    if (index === children.length)
        children.push(child);
    else
        children.splice(index, 0, child);
    child._parent = this;
    return child;
};

/**
 * Remove child object
 * @param {Number|uno.Object} childOrIndex - Index or object to remove
 * @returns {Boolean} - Is child removed
 */
uno.Object.prototype.removeChild = function(childOrIndex) {
    if (!this._children)
        return false;
    var children = this._children;
    var index = childOrIndex || 0;
    if (childOrIndex instanceof uno.Object) {
        index = children.indexOf(childOrIndex);
        if (index === -1)
            return false;
    } else {
        if (index < 0 || index >= children.length)
            return false;
        childOrIndex = children[index];
    }
    children.splice(index, 1);
    childOrIndex._parent = null;
    return true;
};

/**
 * Remove children objects
 * @returns {Boolean} - Is any child removed
 */
uno.Object.prototype.removeAll = function() {
    if (!this._children)
        return false;
    var children = this._children;
    for (var i = 0, l = children.length; i < l; ++i)
        children[i]._parent = null;
    children.length = 0;
    return true;
};

/**
 * Remove this object from the parent
 * @returns {Boolean}
 */
uno.Object.prototype.removeSelf = function() {
    if (!this._parent)
        return true;
    this._parent.remove(this);
    return true;
};

/**
 * Get child at index
 * @param {Number} index - Index of the child
 * @returns {uno.Object}
 */
uno.Object.prototype.getChild = function(index) {
    if (!this._children)
        return undefined;
    index = index || 0;
    if (index < 0 || index >= this._children.length)
        return undefined;
    return this._children[index];
};

/**
 * Add component to object<br>
 *     Component should have static property <code>name</code> with value not have name with first character "_"<br>
 *     Name of the component should be unique for current object<br>
 *     Component can have methods <code>update</code> and <code>render</code> they will call every frame
 * @param {Function} component - Constructor of the component
 * @returns {Boolean}
 */
uno.Object.prototype.addComponent = function(component) {
    var id = component.id;
    if (!id)
        return uno.error('Component have no property name');
    if (id.charCodeAt(0) === '_')
        return uno.error('Component should not have name with first character "_" [', id, ']');
    if (this[id])
        return uno.error('Component with name [', id, '] already exist');
    var c = this[id] = new component(this);
    if (component.prototype.update) {
        if (this._updates)
            this._updates.push(c);
        else
            this._updates = [c];
    }
    if (component.prototype.render) {
        if (this._renders)
            this._renders.push(c);
        else
            this._renders = [c];
    }
    if (component.prototype.input) {
        if (this._inputs)
            this._inputs.push(c);
        else
            this._inputs = [c];
    }
    return true;
};

/**
 * Remove component from object
 * @param {Function} component
 * @returns {boolean}
 */
uno.Object.prototype.removeComponent = function(component) {
    var c = this[component.id];
    if (!c)
        return false;
    c.object = null;
    var index;
    if (this._updates) {
        index = this._updates.indexOf(c);
        if (index !== -1)
            this._updates.splice(index, 1);
    }
    if (this._renders) {
        index = this._renders.indexOf(c);
        if (index !== -1)
            this._renders.splice(index, 1);
    }
    if (this._inputs) {
        index = this._inputs.indexOf(c);
        if (index !== -1)
            this._inputs.splice(index, 1);
    }
    delete this[component.id];
    return true;
};

/**
 * Destroy object and components
 */
uno.Object.prototype.destroy = function() {
    this.removeAll();
    this.removeSelf();
    var i, list;
    list = this._updates;
    if (list) {
        i = list.length;
        while (i--)
            this[list[i]] = null;
        list.length = 0;
    }
    list = this._renders;
    if (list) {
        i = list.length;
        while (i--)
            this[list[i]] = null;
        list.length = 0;
    }
    list = this._inputs;
    if (list) {
        i = list.length;
        while (i--)
            this[list[i]] = null;
        list.length = 0;
    }
};

/**
 * Call <code>update</code> method for current object and all children recursively
 * @param {uno.CanvasRender|uno.WebglRender} render - Render for using it in update handler
 * @param {Number} deltaTime - Time after last update
 */
uno.Object.prototype.update = function(render, deltaTime) {
    var i, l, items;
    if (this._updates) {
        items = this._updates;
        for (i = 0, l = items.length; i < l; ++i)
            items[i].update(render, deltaTime);
    }
    items = this._children;
    if (!items || !items.length)
        return;
    for (i = 0, l = items.length; i < l; ++i)
        items[i].update(render, deltaTime);
};

/**
 * Call <code>render</code> method for current object and all children recursively
 * @param {uno.CanvasRender|uno.WebglRender} render - Render for using it in render handler
 * @param {Number} deltaTime - Time after last render
 */
uno.Object.prototype.render = function(render, deltaTime) {
    var i, l, items;
    if (this._renders) {
        items = this._renders;
        for (i = 0, l = items.length; i < l; ++i)
            items[i].render(render, deltaTime);
    }
    items = this._children;
    if (!items || !items.length)
        return;
    for (i = 0, l = items.length; i < l; ++i)
        items[i].render(render, deltaTime);
};

/**
 * Call <code>input</code> method for current object and all children recursively
 * @param {Object} event - Input event
 * @param {uno.CanvasRender|uno.WebglRender} render - Render for using it in input handler
 */
uno.Object.prototype.input = function(event, render) {
    var i, l, items;
    if (this._inputs) {
        items = this._inputs;
        for (i = 0, l = items.length; i < l; ++i)
            items[i].input(event, render);
    }
    items = this._children;
    if (!items || !items.length)
        return;
    for (i = 0, l = items.length; i < l; ++i)
        items[i].input(event, render);
};

/**
 * Object factory helper
 * @param components
 * @returns {uno.Object}
 */
uno.Object.create = function(components) {
    if (!(components instanceof Array))
        components = Array.prototype.slice.call(arguments);
    var object = new uno.Object();
    for (var i = 0, l = components.length; i < l; ++i)
        object.addComponent(components[i]);
    return object;
};
/**
 * Sprite component
 * @param {uno.Object} object - Host object
 * @constructor
 */
uno.Sprite = function(object) {
    /**
     * Host object
     * @type {uno.Object}
     * @default null
     */
    this.object = object;

    /**
     * Texture for rendering sprite
     * @type {uno.Texture}
     * @default null
     */
    this.texture = null;

    /**
     * Texture frame for rendering
     * @type {uno.Rect}
     * @default null
     */
    this.frame = new uno.Rect();

    /**
     * Opacity of the sprite
     * @type {Number}
     * @default 1
     */
    this.alpha = 1;

    /**
     * Tint color
     * @type {uno.Color}
     * @default uno.Color.WHITE
     */
    this.tint = uno.Color.WHITE.clone();

    /**
     * Blend mode. See {@link uno.Render} constants
     * @type {Number}
     * @default uno.Render.BLEND_NORMAL
     */
    this.blend = uno.Render.BLEND_NORMAL;
};

/**
 * ID of the component
 * @type {String}
 * @default sprite
 */
uno.Sprite.id = 'sprite';

/**
 * Render method of the component
 * @param {CanvasRender|WebglRender} render
 */
uno.Sprite.prototype.render = function(render) {
    if (!this.object || !this.object.transform || !this.texture || !this.texture.ready || !this.alpha)
        return;
    if (!this.frame.width && !this.frame.height) {
        this.frame.width = this.texture.width;
        this.frame.height = this.texture.height;
    }
    render.transform(this.object.transform.matrix);
    render.blendMode(this.blend);
    render.drawTexture(this.texture, this.frame, this.alpha, this.tint);
};
/**
 * Transform component
 * @param {uno.Object} object - Host object
 * @constructor
 */
uno.Transform = function(object) {
    /**
     * Host object
     * @type {uno.Object}
     */
    this.object = object;

    /**
     * Position of the object
     * @type {uno.Point}
     * @default uno.Point(1, 1)
     */
    this.position = new uno.Point(0, 0);

    /**
     * Scale of the object
     * @type {uno.Point}
     * @default uno.Point(1, 1);
     */
    this.scale = new uno.Point(1, 1);

    /**
     * Pivot of the object
     * @type {uno.Point}
     * @default uno.Point(0, 0);
     */
    this.pivot = new uno.Point(0, 0);

    /**
     * Rotation of the object
     * @type {Number}
     * @default 0
     */
    this.rotation = 0;

    /**
     * Transform matrix of the object
     * @type {uno.Matrix}
     * @default uno.Matrix.IDENTITY
     */
    this.matrix = new uno.Matrix();
};

uno.Transform.id = 'transform';

uno.Transform.prototype.update = function() {
    this.matrix.transform(this.position, this.scale, this.rotation, this.pivot,
        this.object && this.object.parent && this.object.parent.transform ?
            this.object.parent.transform.matrix : uno.Matrix.IDENTITY);
};

uno.Transform.prototype.setPosition = function(x, y) {
    this.position.set(x, y);
};

uno.Transform.prototype.setScale = function(x, y){
    this.scale.set(x, y);
};

uno.Transform.prototype.setPivot = function(x, y){
    this.pivot.set(x, y);
};
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = uno;
        }
        exports.uno = uno;
    } else if (typeof define !== 'undefined' && define.amd) {
        define(uno);
    } else {
        root.uno = uno;
    }
}).call(this);
//# sourceMappingURL=Uno.dev.js.map