/**
 * UnoJS engine<br>
 * Desktop browser support: IE 9+, FF 4+, Chrome 4+, Opera 11.6+, Safari 5+<br>
 * Mobile browser support: iOS 4 Safari and other browsers (iPhone 4+, iPad 2+),<br>
 *      Android 2.2 Browser (Samsung Galaxy S+), Opera Mobile 11.50, Blackberry browser 7+, IE Mobile 10+<br>
 * Desktop WebGL mode support: IE 11+, FF 4+ (partial), Chrome 8+ (partial) 18+ (full),<br>
 *      Opera 12+ (partial) 15+ (full), Safari 5.1+ (partial) 8+ (full)<br>
 * Mobile WebGL mode support: iOS 8+, Blackberry 10+, Opera Mobile 12+, Chrome for Android 36+, Firefox for Android 31+<br>
 *      (partial) - Support listed as "partial" refers to the fact that not all users with these browsers have WebGL access.<br>
 *          This is due to the additional requirement for users to have up to date video drivers<br>
 *      (full) - All video cards supported<br>
 * Market Share (July 2014, http://caniuse.com/usage_table.php):<br>
 *      Chrome 4+ (33.76%), FF 4+ (13.34%), IE 9+ (12.76%), Safari 5+ (3.33%), Opera 11.6+ (0.95%), iOS Safari (7.08%),<br>
 *      Android Browser (6.74%), Chrome Android (6.35%) FF Android (0.13%) IE Mobile (0.43%), Blackberry Browser (0.01%)<br>
 * Total support include mobile browsers: 84.88% + 6.47% (most of not included browsers) ~= 91.35%
 * @namespace uno
 * @author Ruslan Murashko
 */
var uno = uno || {}; // jshint ignore:line

/**
 * Get current timestamp
 * @returns {Number}
 */
uno.time = function() {
    if (window && window.perfomance)
        return window.perfomance.now();
    return Date.now();
};

/**
 * Print log message
 * @param {...String} message - Message strings that will be concatenated
 * @returns {Boolean} - <code>true</code> for using with <code>return</code>
 */
uno.log = function() {
    if (uno.Browser.any && window.console) {
        console.log('%cUno: ' + Array.prototype.slice.call(arguments).join(' '), 'color: blue');
    }
    return true;
};

/**
 * Print warning message
 * @param {...String} message - Message strings that will be concatenated
 * @returns {Boolean} - <code>false</code> for using with <code>return</code>
 */
uno.warn = function() {
    if (uno.Browser.any && window.console) {
        console.warn('%cUno: ' + Array.prototype.slice.call(arguments).join(' '), 'color: orange');
    }
    return false;
};

/**
 * Print error message
 * @param {...String} message - Message strings that will be concatenated
 * @returns {Boolean} - <code>false</code> for using with <code>return</code>
 */
uno.error = function() {
    if (uno.Browser.any && window.console) {
        console.error('Uno: ' + Array.prototype.slice.call(arguments).join(' '));
    }
    return false;
};