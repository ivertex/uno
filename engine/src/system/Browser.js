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
     * @member {Boolean} edge - Current browser is Edge
     * @readonly
     */
    this.edge = false;

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
                name: 'edge',
                exp: /(edge)\/((\d+)?[\w\.]+)/i, // IE11
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