/**
 * Keyboard is responsible for handling all aspects of keyboard interaction
 * @namespace
 */
uno.Keyboard = function() {
    /**
     * @memberof uno.Keyboard
     * @member {Object} _keys - Keyboard buttons key down states (true/false)
     * @private
     */
    this._keys = {};

    /**
     * @memberof uno.Keyboard
     * @member {Boolean} _control - Is CONTROL button pressed
     * @private
     */
    this._control = false;

    /**
     * @memberof uno.Keyboard
     * @member {Boolean} _alt - Is ALT button pressed
     * @private
     */
    this._alt = false;

    /**
     * @memberof uno.Keyboard
     * @member {Boolean} _shift - Is SHIFT button pressed
     * @private
     */
    this._shift = false;

    /**
     * @memberof uno.Keyboard
     * @member {Boolean} _command - Is COMMAND button pressed
     * @private
     */
    this._command = false;

    /**
     * @memberof uno.Keyboard
     * @member {Object} _controls - Control key codes list
     * @private
     */
    this._controls = {};

    /**
     * @memberof uno.Keyboard
     * @member {Number} _lastKey - Last key code
     * @private
     */
    this._lastKey = 0;

    /**
     * @memberof uno.Keyboard
     * @member {Number} _lastChar - Last key char
     * @private
     */
    this._lastChar = 0;

    /**
     * @memberof uno.Keyboard
     * @member {uno.Keyboard} _event - Event for dispatching
     * @private
     */
    this._event = new uno.KeyboardEvent();

    this._initialize();
};

/**
 * Check is event type equal to any of {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @static
 * @returns {Boolean}
 */
uno.Keyboard.prototype.any = function(event) {
    return event.type === uno.Keyboard.UP || event.type === uno.Keyboard.DOWN;
};

/**
 * Check is event type is {@link uno.Keyboard.UP}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @static
 * @returns {Boolean}
 */
uno.Keyboard.prototype.up = function(event) {
    return event.type === uno.Keyboard.UP;
};

/**
 * Check is event type is {@link uno.Keyboard.DOWN}
 * @param {uno.MouseEvent|uno.KeyboardEvent|uno.TouchEvent} event - Event to check
 * @static
 * @returns {Boolean}
 */
uno.Keyboard.prototype.down = function(event) {
    return event.type === uno.Keyboard.DOWN;
};

/**
 * Is keyboard button with code pressed
 * @param {Number} key - The key code of the button
 * @returns {Boolean}
 */
uno.Keyboard.prototype.key = function(key) {
    return this._keys[key];
};

/**
 * @memberof uno.Keyboard
 * @member {Boolean} control - Is CONTROL button pressed
 * @readonly
 */
Object.defineProperty(uno.Keyboard.prototype, 'control', {
    get: function () {
        return this._control;
    }
});

/**
 * @memberof uno.Keyboard
 * @member {Boolean} alt - Is ALT button pressed
 * @readonly
 */
Object.defineProperty(uno.Keyboard.prototype, 'alt', {
    get: function () {
        return this._alt;
    }
});

/**
 * @memberof uno.Keyboard
 * @member {Boolean} shift - Is SHIFT button pressed
 * @readonly
 */
Object.defineProperty(uno.Keyboard.prototype, 'shift', {
    get: function () {
        return this._shift;
    }
});

/**
 * @memberof uno.Keyboard
 * @member {Boolean} command - Is COMMAND button pressed
 * @readonly
 */
Object.defineProperty(uno.Keyboard.prototype, 'command', {
    get: function () {
        return this._command;
    }
});

/**
 * Initialize mouse events
 * @private
 */
uno.Keyboard.prototype._initialize = function() {
    var items = [
        33, 34, 35, 36, 37, 38, 39, 40, // Page up, Page down, End, Home, Left, Up, Right, Down
        45, 46, 47, // Insert, Delete, Help
        112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, // F1 - F15
        8, 9, 12, 16, 17, 18, 20, 27,   // Backspace, Tab, Clear, Shift, Control, Alt, Caps lock, Esc
        91, 93,  // Command left, Command right
        144    // Num lock
    ];

    for (var i = 0, l = items.length; i < l; ++i)
        this._controls[items[i]] = true;

    if (uno.Browser.any) {
        window.addEventListener('keydown', this._onDown.bind(this), true);
        window.addEventListener('keyup', this._onUp.bind(this), true);
        window.addEventListener('keypress', this._onPress.bind(this), true);
    }
};

/**
 * Call input handler for all renders root objects
 * @param {Number} type - Type of event<br>
 *     Either: {@link uno.Keyboard.UP}, {@link uno.Keyboard.DOWN}
 * @param {Number} key - Key code
 * @param {Number} char - Char code
 * @private
 */
uno.Keyboard.prototype._callInput = function(type, key, char) {
    var renders = uno.Render.renders;
    var event = this._event;
    event._set(type, key, char, this._alt, this._control, this._shift, this._command);
    for (var i = 0, l = renders.length; i < l; ++i) {
        var render = renders[i];
        if (render.root)
            render.root.input(event, render);
    }
    event._reset();
};

/**
 * Keyboard over callback
 * @param {KeyboardEvent} e - Keyboard event
 * @private
 */
uno.Keyboard.prototype._onDown = function(e) {
    var key = e.which || e.keyCode;
    this._keys[key] = true;
    if (this._controls[key]) {
        this._lastChar = 0;
        this._callInput(uno.Keyboard.DOWN, key, this._lastChar);
        uno.log('Press key:', key, 'char:', this._lastChar);
    } else
        this._lastKey = key;
};

/**
 * Keyboard down callback
 * @param {KeyboardEvent} e - Keyboard event
 * @private
 */
uno.Keyboard.prototype._onPress = function(e) {
    this._lastChar = e.charCode;
    this._callInput(uno.Keyboard.DOWN, this._lastKey, this._lastChar);
    uno.log('Press key:', this._lastKey, 'char:', this._lastChar);
};

/**
 * Keyboard out callback
 * @param {KeyboardEvent} e - Keyboard event
 * @private
 */
uno.Keyboard.prototype._onUp = function(e) {
    var key = e.which || e.keyCode;
    this._keys[key] = false;
    this._callInput(uno.Keyboard.UP, key, this._lastChar);
    uno.log('Up key:', key, 'char:', this._lastChar);
};

uno.Keyboard = new uno.Keyboard();

/**
 * Keyboard up event type
 * @const
 * @type {Number}
 */
uno.Keyboard.UP = 200;

/**
 * Mouse down event type
 * @const
 * @type {Number}
 */
uno.Keyboard.DOWN = 201;

/**
 * Key constants
 * TODO: fix this docs
 * @readonly
 * @property {Number} A - 'A' button key code
 * @property {Number} B - 'B' button key code
 * @property {Number} C - 'C' button key code
 * @property {Number} D - 'D' button key code
 * @property {Number} E - 'E' button key code
 * @property {Number} F - 'F' button key code
 * @property {Number} G - 'G' button key code
 * @property {Number} H - 'H' button key code
 * @property {Number} I - 'I' button key code
 * @property {Number} J - 'J' button key code
 * @property {Number} K - 'K' button key code
 * @property {Number} L - 'L' button key code
 * @property {Number} M - 'M' button key code
 * @property {Number} N - 'N' button key code
 * @property {Number} O - 'O' button key code
 * @property {Number} P - 'P' button key code
 * @property {Number} Q - 'Q' button key code
 * @property {Number} R - 'R' button key code
 * @property {Number} S - 'S' button key code
 * @property {Number} T - 'T' button key code
 * @property {Number} U - 'U' button key code
 * @property {Number} V - 'V' button key code
 * @property {Number} W - 'W' button key code
 * @property {Number} X - 'X' button key code
 * @property {Number} Y - 'Y' button key code
 * @property {Number} Z - 'Z' button key code
 * @property {Number} ZERO - '0' button key code
 * @property {Number} ONE - '1' button key code
 * @property {Number} TWO - '2' button key code
 * @property {Number} THREE - '3' button key code
 * @property {Number} FOUR - '4' button key code
 * @property {Number} FIVE - '5' button key code
 * @property {Number} SIX - '6' button key code
 * @property {Number} SEVEN - '7' button key code
 * @property {Number} EIGHT - '8' button key code
 * @property {Number} NINE - '9' button key code
 * @property {Number} NUMPAD_0 - '0' numpad button key code
 * @property {Number} NUMPAD_1 - '1' numpad button key code
 * @property {Number} NUMPAD_2 - '2' numpad button key code
 * @property {Number} NUMPAD_3 - '3' numpad button key code
 * @property {Number} NUMPAD_4 - '4' numpad button key code
 * @property {Number} NUMPAD_5 - '5' numpad button key code
 * @property {Number} NUMPAD_6 - '6' numpad button key code
 * @property {Number} NUMPAD_7 - '7' numpad button key code
 * @property {Number} NUMPAD_8 - '8' numpad button key code
 * @property {Number} NUMPAD_9 - '9' numpad button key code
 * @property {Number} NUMPAD_MULTUPLY - '*' numpad button key code
 * @property {Number} NUMPAD_ADD - '+' numpad button key code
 * @property {Number} NUMPAD_ENTER - 'Enter' numpad button key code
 * @property {Number} NUMPAD_SUBTRACT - '-' numpad button key code
 * @property {Number} NUMPAD_DECIMAL - '.' numpad button key code
 * @property {Number} NUMPAD_DIVIDE - '/' numpad button key code
 * @property {Number} F1 - 'F1' button key code
 * @property {Number} F2 - 'F2' button key code
 * @property {Number} F3 - 'F3' button key code
 * @property {Number} F4 - 'F4' button key code
 * @property {Number} F5 - 'F5' button key code
 * @property {Number} F6 - 'F6' button key code
 * @property {Number} F7 - 'F7' button key code
 * @property {Number} F8 - 'F8' button key code
 * @property {Number} F9 - 'F9' button key code
 * @property {Number} F10 - 'F10' button key code
 * @property {Number} F11 - 'F11' button key code
 * @property {Number} F12 - 'F12' button key code
 * @property {Number} F13 - 'F13' button key code
 * @property {Number} F14 - 'F14' button key code
 * @property {Number} F15 - 'F15' button key code
 * @property {Number} COLON - ';' button key code
 * @property {Number} UNDERSCORE - '_' button key code
 * @property {Number} QUESTION_MARK - '?' button key code
 * @property {Number} TILDE - '~' button key code
 * @property {Number} OPEN_BRACKET - '[' button key code
 * @property {Number} BACKWARD_SLASH - '/' button key code
 * @property {Number} CLOSED_BRACKET - ']' button key code
 * @property {Number} QUOTES - ''' button key code
 * @property {Number} BACKSPACE - 'Back Space' button key code
 * @property {Number} TAB - 'Tab' button key code
 * @property {Number} CLEAR - 'Clear' button key code
 * @property {Number} ENTER - 'Enter' button key code
 * @property {Number} SHIFT - 'Shift' button key code
 * @property {Number} CONTROL - 'Control' button key code
 * @property {Number} ALT - 'Alt' button key code
 * @property {Number} CAPS_LOCK - 'Caps Lock' button key code
 * @property {Number} ESC - 'Esc' button key code
 * @property {Number} SPACEBAR - 'Space Bar' button key code
 * @property {Number} PAGE_UP - 'Page Up' button key code
 * @property {Number} PAGE_DOWN - 'Page Down' button key code
 * @property {Number} END - 'End' button key code
 * @property {Number} HOME - 'Home' button key code
 * @property {Number} ARROW_LEFT - 'Left' button key code
 * @property {Number} ARROW_UP - 'Up' button key code
 * @property {Number} ARROW_RIGHT - 'Right' button key code
 * @property {Number} ARROW_DOWN - 'Down' button key code
 * @property {Number} INSERT - 'Insert' button key code
 * @property {Number} DELETE - 'Delete' button key code
 * @property {Number} HELP - 'Help' button key code
 * @property {Number} NUM_LOCK - 'Num Lock' button key code
 * @property {Number} PLUS - '+' button key code
 * @property {Number} MINUS - '-' button key code
 */
uno.Keyboard.A = 'A'.charCodeAt(0);
uno.Keyboard.B = 'B'.charCodeAt(0);
uno.Keyboard.C = 'C'.charCodeAt(0);
uno.Keyboard.D = 'D'.charCodeAt(0);
uno.Keyboard.E = 'E'.charCodeAt(0);
uno.Keyboard.F = 'F'.charCodeAt(0);
uno.Keyboard.G = 'G'.charCodeAt(0);
uno.Keyboard.H = 'H'.charCodeAt(0);
uno.Keyboard.I = 'I'.charCodeAt(0);
uno.Keyboard.J = 'J'.charCodeAt(0);
uno.Keyboard.K = 'K'.charCodeAt(0);
uno.Keyboard.L = 'L'.charCodeAt(0);
uno.Keyboard.M = 'M'.charCodeAt(0);
uno.Keyboard.N = 'N'.charCodeAt(0);
uno.Keyboard.O = 'O'.charCodeAt(0);
uno.Keyboard.P = 'P'.charCodeAt(0);
uno.Keyboard.Q = 'Q'.charCodeAt(0);
uno.Keyboard.R = 'R'.charCodeAt(0);
uno.Keyboard.S = 'S'.charCodeAt(0);
uno.Keyboard.T = 'T'.charCodeAt(0);
uno.Keyboard.U = 'U'.charCodeAt(0);
uno.Keyboard.V = 'V'.charCodeAt(0);
uno.Keyboard.W = 'W'.charCodeAt(0);
uno.Keyboard.X = 'X'.charCodeAt(0);
uno.Keyboard.Y = 'Y'.charCodeAt(0);
uno.Keyboard.Z = 'Z'.charCodeAt(0);
uno.Keyboard.ZERO = '0'.charCodeAt(0);
uno.Keyboard.ONE = '1'.charCodeAt(0);
uno.Keyboard.TWO = '2'.charCodeAt(0);
uno.Keyboard.THREE = '3'.charCodeAt(0);
uno.Keyboard.FOUR = '4'.charCodeAt(0);
uno.Keyboard.FIVE = '5'.charCodeAt(0);
uno.Keyboard.SIX = '6'.charCodeAt(0);
uno.Keyboard.SEVEN = '7'.charCodeAt(0);
uno.Keyboard.EIGHT = '8'.charCodeAt(0);
uno.Keyboard.NINE = '9'.charCodeAt(0);
uno.Keyboard.NUMPAD_0 = 96;
uno.Keyboard.NUMPAD_1 = 97;
uno.Keyboard.NUMPAD_2 = 98;
uno.Keyboard.NUMPAD_3 = 99;
uno.Keyboard.NUMPAD_4 = 100;
uno.Keyboard.NUMPAD_5 = 101;
uno.Keyboard.NUMPAD_6 = 102;
uno.Keyboard.NUMPAD_7 = 103;
uno.Keyboard.NUMPAD_8 = 104;
uno.Keyboard.NUMPAD_9 = 105;
uno.Keyboard.NUMPAD_MULTIPLY = 106;
uno.Keyboard.NUMPAD_ADD = 107;
uno.Keyboard.NUMPAD_ENTER = 108;
uno.Keyboard.NUMPAD_SUBTRACT = 109;
uno.Keyboard.NUMPAD_DECIMAL = 110;
uno.Keyboard.NUMPAD_DIVIDE = 111;
uno.Keyboard.F1 = 112;
uno.Keyboard.F2 = 113;
uno.Keyboard.F3 = 114;
uno.Keyboard.F4 = 115;
uno.Keyboard.F5 = 116;
uno.Keyboard.F6 = 117;
uno.Keyboard.F7 = 118;
uno.Keyboard.F8 = 119;
uno.Keyboard.F9 = 120;
uno.Keyboard.F10 = 121;
uno.Keyboard.F11 = 122;
uno.Keyboard.F12 = 123;
uno.Keyboard.F13 = 124;
uno.Keyboard.F14 = 125;
uno.Keyboard.F15 = 126;
uno.Keyboard.COLON = 186;
uno.Keyboard.EQUALS = 187;
uno.Keyboard.UNDERSCORE = 189;
uno.Keyboard.QUESTION_MARK = 191;
uno.Keyboard.TILDE = 192;
uno.Keyboard.OPEN_BRACKET = 219;
uno.Keyboard.BACKWARD_SLASH = 220;
uno.Keyboard.CLOSED_BRACKET = 221;
uno.Keyboard.QUOTES = 222;
uno.Keyboard.BACKSPACE = 8;
uno.Keyboard.TAB = 9;
uno.Keyboard.CLEAR = 12;
uno.Keyboard.ENTER = 13;
uno.Keyboard.SHIFT = 16;
uno.Keyboard.CONTROL = 17;
uno.Keyboard.ALT = 18;
uno.Keyboard.CAPS_LOCK = 20;
uno.Keyboard.ESC = 27;
uno.Keyboard.SPACEBAR = 32;
uno.Keyboard.PAGE_UP = 33;
uno.Keyboard.PAGE_DOWN = 34;
uno.Keyboard.END = 35;
uno.Keyboard.HOME = 36;
uno.Keyboard.ARROW_LEFT = 37;
uno.Keyboard.ARROW_UP = 38;
uno.Keyboard.ARROW_RIGHT = 39;
uno.Keyboard.ARROW_DOWN = 40;
uno.Keyboard.INSERT = 45;
uno.Keyboard.DELETE = 46;
uno.Keyboard.HELP = 47;
uno.Keyboard.NUM_LOCK = 144;
uno.Keyboard.PLUS = 43;
uno.Keyboard.MINUS = 45;