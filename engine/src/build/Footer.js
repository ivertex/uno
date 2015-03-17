    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = uno;
        }
        exports.uno = uno;
    } else if (typeof define !== 'undefined' && define.amd) {
        define(uno);
    } else {
        root.uno = uno;
    }
}).call(this);