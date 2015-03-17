/**
 * A polyfill for requestAnimationFrame
 *
 * @method requestAnimationFrame
 */

/**
 * A polyfill for cancelAnimationFrame
 *
 * @method cancelAnimationFrame
 */

(function() {
    if (!window)
        return;

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

/**
 * A polyfill for Function.prototype.bind
 *
 * @method bind
 */

(function() {
    if (typeof Function.prototype.bind !== 'function') {
        Function.prototype.bind = (function () {
            var slice = Array.prototype.slice;
            return function (thisArg) {
                var target = this, boundArgs = slice.call(arguments, 1);

                if (typeof target !== 'function') throw new TypeError();

                function bound() {
                    var args = boundArgs.concat(slice.call(arguments));
                    target.apply(this instanceof bound ? this : thisArg, args);
                }

                bound.prototype = (function F(proto) {
                    if (proto) F.prototype = proto;
                    if (!(this instanceof F)) return new F();
                })(target.prototype);

                return bound;
            };
        })();
    }
})();