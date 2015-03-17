/**
 * Device information
 * @namespace
 */
uno.Device = function() {
    /**
     * @memberof uno.Device
     * @member {Boolean} iPhone - Device is iPhone
     * @readonly
     */
    this.iPhone = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} iPad - Device is iPad
     * @readonly
     */
    this.iPad = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} appleTV - Device is Apple TV
     * @readonly
     */
    this.appleTV = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} windowsPhone - Device is Windows Phone
     * @readonly
     */
    this.windowsPhone = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} blackberry - Device is BlackBerry
     * @readonly
     */
    this.blackberry = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} kindle - Device is Amazon Kindle
     * @readonly
     */
    this.kindle = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} firePhone - Device is Amazon Fire Phone
     * @readonly
     */
    this.firePhone = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} ouya - Device is Ouya
     * @readonly
     */
    this.ouya = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} nintendo - Device is Nintendo
     * @readonly
     */
    this.nintendo = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} playstation - Device is Sony Playstation
     * @readonly
     */
    this.playstation = false;

    /**
     * @memberof uno.Device
     * @member {Boolean} xbox - Device is Microsoft Xbox
     * @readonly
     */
    this.xbox = false;

    this._initialize();
};

/**
 * Initialize and check device information
 * @private
 */
uno.Device.prototype._initialize = function() {
    if (navigator && navigator.userAgent) {
        var ua = navigator.userAgent.toLowerCase();
        var res;
        var regs = [
            {
                name: 'iPhone',
                exp: /\((iphone);.+(apple)/i,   // iPhone
                mobile: true
            },
            {
                name: 'iPad',
                exp: /\((ipad);.+(apple)/i,   // iPad
                mobile: true
            },
            {
                name: 'appleTV',
                exp: /(apple\s{0,1}tv)/i,   // Apple TV
                mobile: true
            },
            {
                name: 'windowsPhone',
                exp: /(windows\sphone)/i,   // Windows Phone
                mobile: true
            },
            {
                name: 'blackberry',
                exp: /(blackberry)[\s-]?(\w+)/i,   // BlackBerry
                mobile: true
            },
            {
                name: 'blackberry',
                exp: /\(bb10;\s(\w+)/i,   // BlackBerry
                mobile: true
            },
            {
                name: 'kindle',
                exp: /(kindle)\/([\w\.]+)/i,   // Amazon Kindle
                mobile: true
            },
            {
                name: 'kindle',
                exp: /(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i,   // Amazon Kindle Fire
                mobile: true
            },
            {
                name: 'firePhone',
                exp: /(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i,   // Amazon Fire Phone
                mobile: true
            },
            {
                name: 'ouya',
                exp: /\s(ouya)\s/i,   // Ouya
                mobile: false
            },
            {
                name: 'nintendo',
                exp: /(nintendo)\s([wids3u]+)/i,   // Nintendo
                mobile: true
            },
            {
                name: 'playstation',
                exp: /(playstation\s[3portablevi]+)/i,   // Sony Playstation
                mobile: false
            },
            {
                name: 'xbox',
                exp: /[\s\(;](xbox(?:\sone)?)[\s\);]/i,   // Microsoft Xbox
                mobile: false
            }
        ];
        for (var i = 0, l = regs.length; i < l; ++i) {
            var info = regs[i];
            res = info.exp.exec(ua);
            if (res) {
                this[info.name] = true;
                this.mobile = info.mobile;
                return;
            }
        }
    }
};

uno.Device = new uno.Device();