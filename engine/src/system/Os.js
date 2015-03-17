/**
 * Operation system information
 * @namespace
 */
uno.Os = function() {
    /**
     * @memberof uno.Os
     * @member {Boolean} mobile - Is current OS mobile
     * @readonly
     */
    this.mobile = false;

    /**
     * @memberof uno.Os
     * @member {Number} name - Name of the current OS
     * @readonly
     */
    this.name = '';

    /**
     * @memberof uno.Os
     * @member {Number} version - Version of the current OS
     * @readonly
     */
    this.version = '';

    /**
     * @memberof uno.Os
     * @member {Boolean} windows - Operation system is Windows
     * @readonly
     */
    this.windows = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} linux - Operation system is Linux
     * @readonly
     */
    this.linux = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} android - Operation system is Android
     * @readonly
     */
    this.android = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} macOS - Operation system is MacOS
     * @readonly
     */
    this.macOS = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} iOS - Operation system is iOS
     * @readonly
     */
    this.iOS = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} blackberry - Operation system is BlackBerry
     * @readonly
     */
    this.blackberry = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} tizen - Operation system is Tizen
     * @readonly
     */
    this.tizen = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} sailfishOS - Operation system is Sailfish OS
     * @readonly
     */
    this.sailfishOS = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} firefoxOS - Operation system is Firefox OS
     * @readonly
     */
    this.firefoxOS = false;

    /**
     * @memberof uno.Os
     * @member {Boolean} chromiumOS - Operation system is Chromium OS
     * @readonly
     */
    this.chromiumOS = false;

    this._initialize();
};

/**
 * Initialize and check operation system information
 * @private
 */
uno.Os.prototype._initialize = function() {
    if (navigator && navigator.userAgent) {
        var ua = navigator.userAgent;
        var res;
        var regs = [
            {
                name: 'windows',
                exp: /microsoft\s(windows)\s(vista|xp)/i,   // Windows
                version: 2,
                mobile: false
            },
            {
                name: 'windows',
                exp: /(windows)\snt\s([\w\s\.]+);/i,   // Windows
                version: 2,
                mobile: false
            },
            {
                name: 'windows',
                exp: /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i,   // Windows Phone
                version: 2,
                mobile: true
            },
            {
                name: 'blackberry',
                exp: /\((bb)(10);/i,   // BlackBerry 10
                version: 2,
                mobile: true
            },
            {
                name: 'blackberry',
                exp: /(blackberry)\w*\/?([\w\.]+)*/i,   // BlackBerry
                version: 2,
                mobile: true
            },
            {
                name: 'tizen',
                exp: /(tizen)[\/\s]([\w\.]+)/i,   // Tizen
                version: 2,
                mobile: true
            },
            {
                name: 'android',
                exp: /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,   // Android
                version: 2,
                mobile: true
            },
            {
                name: 'sailfishOS',
                exp: /linux;.+(sailfish);/i,   // Sailfish OS
                version: 2,
                mobile: false
            },
            {
                name: 'firefoxOS',
                exp: /mozilla.+\(mobile;.+gecko.+firefox/i,   // Firefox OS
                version: 2,
                mobile: false
            },
            {
                name: 'chromiumOS',
                exp: /(cros)\s[\w]+\s([\w\.]+\w)/i,   // Chromium OS
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                exp: /(mint)[\/\s\(]?(\w+)*/i,   // Mint
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
                exp: /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                exp: /(hurd|linux)\s?([\w\.]+)*/i,   // Hurd/Linux
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                exp: /(gnu)\s?([\w\.]+)*/i,   // GNU
                version: 2,
                mobile: false
            },
            {
                name: 'linux',
                exp: /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i,   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
                version: 2,
                mobile: false
            },
            {
                name: 'iOS',
                exp: /(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i,   // iOS
                version: 2,
                mobile: true
            },
            {
                name: 'macOS',
                exp: /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,   // Mac OS
                version: 2,
                mobile: false
            },
            {
                name: 'macOS',
                exp: /(macintosh|mac(?=_powerpc)\s)/i,   // Mac OS
                version: false,
                mobile: false
            }
        ];
        for (var i = 0, l = regs.length; i < l; ++i) {
            var info = regs[i];
            res = info.exp.exec(ua);
            if (res) {
                this[info.name] = true;
                this.name = res[1];
                if (info.version !== false && res[info.version])
                    this.version = res[info.version].replace(/_/g, '.');
                this.mobile = info.mobile;
                return;
            }
        }
    }
};

uno.Os = new uno.Os();