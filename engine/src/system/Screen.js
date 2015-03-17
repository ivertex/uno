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