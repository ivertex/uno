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
     * Scale X
     * @name uno.Matrix#a
     * @type {Number}
     * @default 1
     */
    this.a = 1;

    /**
     * Shear Y
     * @name uno.Matrix#b
     * @type {Number}
     * @default 0
     */
    this.b = 0;

    /**
     * Shear X
     * @name uno.Matrix#c
     * @type {Number}
     * @default 0
     */
    this.c = 0;

    /**
     * Scale Y
     * @name uno.Matrix#d
     * @type {Number}
     * @default 1
     */
    this.d = 1;

    /**
     * Translate X
     * @name uno.Matrix#tx
     * @type {Number}
     * @default 0
     */
    this.tx = 0;

    /**
     * Translate Y
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
 * @returns {uno.Matrix} - <code>this</code>
 */
uno.Matrix.prototype.rotate = function(angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var a1 = this.a;
    var c1 = this.c;
    var tx1 = this.tx;
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