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
    render.transform = this.object.transform.matrix;
    render.alpha = this.alpha;
    render.blend = this.blend;
    if (this.frame.width && this.frame.height)
        render.texture(this.texture, this.frame, this.tint);
    else
        render.texture(this.texture, null, this.tint);
};