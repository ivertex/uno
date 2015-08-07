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
     * @member {Number} width - The amount of horizontal space in pixels available to the render
     * @readonly
     */
    this.width = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} height - The amount of vertical space in pixels available to the render
     * @readonly
     */
    this.height = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} totalWidth - Total width of the screen
     * @readonly
     */
    this.totalWidth = 0;

    /**
     * @memberof uno.Screen
     * @member {Number} totalHeight - Total height of the screen
     * @readonly
     */
    this.totalHeight = 0;

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
            this.totalWidth = window.screen.width;
            this.totalHeight = window.screen.height;
            this.depth = window.screen.pixelDepth;
        }
        if (document) {
            var resize = function() {
                self.width = document.documentElement.clientWidth;
                self.height = document.documentElement.clientHeight;

                // TODO: Hack, need to investigate
                if (uno.Browser.chrome || uno.Browser.safari || uno.Browser.opera)
                    self.height -= 4;
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