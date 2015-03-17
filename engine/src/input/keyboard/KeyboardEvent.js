/**
 * Keyboard event class
 * @constructor
 */
uno.KeyboardEvent = function() {
    /**
     * Type of event<br>
     *     Either: {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
     * @type {Number}
     * @private
     */
    this._type = 0;

    /**
     * Keyboard button key code
     * @type {Number}
     * @private
     */
    this._key = 0;

    /**
     * Char code of the keyboard button
     * @type {Number}
     * @private
     */
    this._char = 0;

    /**
     * Is ALT keyboard button pressed
     * @type {Boolean}
     * @private
     */
    this._alt = false;

    /**
     * Is CONTROL keyboard button pressed
     * @type {Boolean}
     * @private
     */
    this._control = false;

    /**
     * Is SHIFT keyboard button pressed
     * @type {Boolean}
     * @private
     */
    this._shift = false;

    /**
     * Is COMMAND keyboard button pressed
     * @type {Boolean}
     * @private
     */
    this._command = false;
};

/**
 * Type of event<br>
 *     Either: {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
 * @name uno.KeyboardEvent#type
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'type', {
    get: function () {
        return this._type;
    }
});

/**
 * Keyboard button key code
 * @name uno.KeyboardEvent#key
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'key', {
    get: function () {
        return this._key;
    }
});

/**
 * Char code of the keyboard button
 * @name uno.KeyboardEvent#char
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'char', {
    get: function () {
        return this._char;
    }
});

/**
 * Is ALT keyboard button pressed
 * @name uno.KeyboardEvent#alt
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'alt', {
    get: function () {
        return this._alt;
    }
});

/**
 * Is CONTROL keyboard button pressed
 * @name uno.KeyboardEvent#control
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'control', {
    get: function () {
        return this._control;
    }
});

/**
 * Is SHIFT keyboard button pressed
 * @name uno.KeyboardEvent#shift
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'shift', {
    get: function () {
        return this._shift;
    }
});

/**
 * Is COMMAND keyboard button pressed
 * @name uno.KeyboardEvent#command
 * @type {Number}
 * @readonly
 */
Object.defineProperty(uno.KeyboardEvent.prototype, 'command', {
    get: function () {
        return this._command;
    }
});

/**
 * Set event params
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
 * @param {Number} key - Keyboard button key code
 * @param {Number} char - Char code of the keyboard button
 * @param {Boolean} alt - Is ALT keyboard button pressed
 * @param {Boolean} control - Is CONTROL keyboard button pressed
 * @param {Boolean} shift - Is SHIFT keyboard button pressed
 * @param {Boolean} command - Is COMMAND keyboard button pressed
 * @private
 */
uno.KeyboardEvent.prototype._set = function(type, key, char, alt, control, shift, command) {
    this._type = type;
    this._key = key;
    this._char = char;
    this._alt = alt;
    this._control = control;
    this._shift = shift;
    this._command = command;
};

/**
 * Reset event params
 * @private
 */
uno.KeyboardEvent.prototype._reset = function() {
    this._type = 0;
    this._key = 0;
    this._char = 0;
    this._alt = false;
    this._control = false;
    this._shift = false;
    this._command = false;
};