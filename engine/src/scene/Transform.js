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