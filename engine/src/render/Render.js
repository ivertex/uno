/**
 * Render creation module
 * @namespace uno.Render
 */
uno.Render = {

    /**
     * Canvas mode rendering
     * @const {Number}
     */
    RENDER_CANVAS: 1,

    /**
     * WebGL mode rendering
     * @const {Number}
     */
    RENDER_WEBGL: 2,

    /**
     * Pixelating texture scaling mode
     * @const {Number}
     */
    SCALE_NEAREST: 0,

    /**
     * Smooth texture scaling mode
     * @const {Number}
     */
    SCALE_LINEAR: 1,

    /**
     * Normal blend mode with optimization for opaque textures in GL mode
     * @const {Number}
     */
    BLEND_NONE: 0,

    /**
     * This is the standard blend mode which uses the top layer alone, without mixing its colors with the layer beneath it
     * @const {Number}
     */
    BLEND_NORMAL: 1,

    /**
     * This blend mode simply adds pixel values of one layer with the other
     * @const {Number}
     */
    BLEND_ADD: 2,

    /**
     * This blend mode multiplies the numbers for each pixel of the top layer with the corresponding pixel for the bottom layer
     * @const {Number}
     */
    BLEND_MULTIPLY: 3,

    /**
     * This blend mode inverts both layers, multiplies them, and then inverts that result
     * @const {Number}
     */
    BLEND_SCREEN: 4,

    /**
     * Default settings for render
     * @const {Object}
     * @property {uno.Color} background - Color for clearing viewport
     * @property {Number} width - Width of render viewport (0 - fullscreen)
     * @property {Number} height - Height of render viewport (0 - fullscreen)
     * @property {Number} fps - Maximum frame per second (0 - stop rendering)
     * @property {Number} ups - Maximum updates per second (0 - stop updating)
     * @property {uno.Color} fillColor - Default fill color
     * @property {uno.Color} lineColor - Default line color
     * @property {Number} lineWidth - Default line width
     * @property {HTMLCanvasElement} canvas - For browser mode canvas element for render
     * @property {Object|String} container - For browser mode ID or HTML element to add new canvas to it if settings.canvas is null
     * @property {Boolean} contextMenu - For browser mode disable or enable right click context menu
     */
    DEFAULT: {
        background: uno.Color.WHITE.clone(),
        width: 0,
        height: 0,
        fps: 60,
        ups: 60,
        fill: uno.Color.WHITE.clone(),
        stroke: uno.Color.BLACK.clone(),
        thickness: 1,
        canvas: null,
        container: null,
        contextMenu: false
    },

    /**
     * List of all created renders
     * @type {Array}
     */
    renders: [],

    /**
     * Counter for render unique id
     * @type {Number}
     * @private
     */
    _uid: 0
};

/**
 * Create new render with settings
 * @param {Object} settings - Settings for the new render<br>
 *     See uno.Render.DEFAULT<br>
 * @returns {uno.CanvasRender|uno.WebglRender}
 */
uno.Render.create = function(settings) {
    settings = settings || {};
    var setts = {};
    var mode = settings.mode || false;

    if (uno.Browser.any) {
        var def = uno.Render.DEFAULT;

        setts.antialias = settings.antialias === undefined ? def.antialias : settings.antialias;
        setts.background = settings.background === undefined ? def.background : settings.background;
        setts.width = settings.width || (def.width || uno.Screen.width);
        setts.height = settings.height || (def.height || uno.Screen.height);
        setts.fps = settings.fps === 0 ? 0 : (settings.fps || def.fps);
        setts.ups = settings.ups === 0 ? 0 : (settings.ups || def.ups);
        setts.contextMenu = settings.contextMenu === undefined ? def.contextMenu : settings.contextMenu;

        if (!settings.canvas) {
            var canvas = document.createElement('canvas');

            if (settings.container instanceof Object) {
                settings.container.appendChild(canvas);
            } else if (settings.container instanceof String) {
                document.getElementById(settings.container).appendChild(canvas);
            } else {
                document.body.appendChild(canvas);
            }

            setts.canvas = canvas;
        } else {
            setts.canvas = settings.canvas;
        }

        if (!mode) {
            if (uno.Capabilities.webgl) {
                return new uno.WebglRender(setts);
            }
            return new uno.CanvasRender(setts);
        }
        if (mode === uno.Render.RENDER_WEBGL) {
            return new uno.WebglRender(setts);
        }
        return new uno.CanvasRender(setts);
    }
    return uno.error('Only browsers currently supported');
};