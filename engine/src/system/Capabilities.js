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
     * @member {Boolean|Number} webgl - Has current environment WebGL rendering support and what version
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
        if (!window.WebGLRenderingContext)
            return false;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        var version = ctx.getParameter(ctx.VERSION);
        return parseFloat(/WebGL\s(\d+\.\d+)/i.exec(version)[1]);
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