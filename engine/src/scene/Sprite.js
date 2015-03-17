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
     * @private
     */
    this._texture = null;

    /**
     * Texture frame for rendering
     * @type {uno.Frame}
     * @default null
     * @private
     */
    this._frame = null;

    /**
     * Is frame dirty (texture changed or not ready)
     * @type {Boolean}
     * @private
     */
    this._dirty = false;

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
 * The sprite texture
 * @name uno.Sprite#texture
 * @type {uno.Texture}
 * @default null
 */
Object.defineProperty(uno.Sprite.prototype, 'texture', {
    get: function() {
        return this._texture;
    },
    set: function(value) {
        this._texture = value;
        this._dirty = true;
    }
});

/**
 * The frame of the texture
 * @name uno.Sprite#frame
 * @type {uno.Frame}
 * @readonly
 */
Object.defineProperty(uno.Sprite.prototype, 'frame', {
    get: function() {
        if (this._frame) {
            if (this._dirty && this._texture && this._texture.ready)
                this._frame.setMaxSize(this._texture.width, this._texture.height);
            return this._frame;
        }
        if (this._texture && this._texture.ready)
            this._frame = new uno.Frame(this._texture.width, this._texture.height);
        else {
            this._frame = new uno.Frame();
            this._dirty = true;
        }
        return this._frame;
    }
});

/**
 * Render method of the component
 * @param {CanvasRender|WebglRender} render
 */
uno.Sprite.prototype.render = function(render) {
    if (!this.object || !this.object.transform || !this._texture || !this._texture.ready || !this.alpha)
        return;
    var frame = this.frame;
    if (!frame.width || !frame.height)
        return;
    render.transform(this.object.transform.matrix);
    render.blendMode(this.blend);
    render.drawTexture(this._texture, frame, this.tint, this.alpha);
};