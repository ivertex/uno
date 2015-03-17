/**
 * Math helpers
 * @namespace
 */
uno.Math = {
    /**
     * @memberof uno.Math
     * @member {Number} RAD_TO_DEG - Radians to degrees multiplier
     * @const
     */
    RAD_TO_DEG: 180 / Math.PI,

    /**
     * @memberof uno.Math
     * @member {Number} DEG_TO_RAD - Degrees to radians multiplier
     * @const
     */
    DEG_TO_RAD: Math.PI / 180,

    /**
     * @memberof uno.Math
     * @member {Number} PI - PI value
     * @const
     */
    PI: Math.PI,

    /**
     * @memberof uno.Math
     * @member {Number} TWO_PI - PI * 2 value
     * @const
     */
    TWO_PI: 2 * Math.PI,

    /**
     * @memberof uno.Math
     * @member {Number} HALF_PI - PI * 0.5 value
     * @const
     */
    HALF_PI: 0.5 * Math.PI
};

/**
 * Is number power of two
 * @param {Number} x - Number to check
 * @returns {Boolean}
 */
uno.Math.isPOT = function(x) {
    return (x & (x - 1)) === 0;
};