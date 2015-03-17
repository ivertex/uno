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