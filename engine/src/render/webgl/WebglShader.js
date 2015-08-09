/**
 * WebGL shader implementation
 * @param {uno.WebglRender} render - WebGL render instance
 * @param {Object} settings - Shader settings
 * @constructor
 */
uno.WebglShader = function(render, settings) {
    /**
     * Host render
     * @type {uno.WebglRender}
     * @private
     */
    this._render = render;

    /**
     * Settings for shader (see examples in ./shaders folder)
     * @type {Object}
     * @private
     */
    this._settings = settings;

    /**
     * Shader program
     * @type {WebGLProgram}
     * @private
     */
    this._program = null;

    /**
     * Vertex shader
     * @type {WebGLShader}
     * @private
     */
    this._vertex = null;

    /**
     * Fragment shader
     * @type {WebGLShader}
     * @private
     */
    this._fragment = null;

    this._restore();
    render._addRestore(this);
};

/**
 * Type Sampler for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.SAMPLER = 0;

/**
 * Type Sampler for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.MATRIX = 1;

/**
 * Type Byte for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.BYTE = 2;

/**
 * Type Unsigned byte for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.UNSIGNED_BYTE = 3;

/**
 * Type Short for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.SHORT = 4;

/**
 * Type Unsigned short for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.UNSIGNED_SHORT = 5;

/**
 * Type Integer for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.INT = 6;

/**
 * Type Unsigned integer for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.UNSIGNED_INT = 7;

/**
 * Type Float for attributes or uniforms
 * @const
 * @type {Number}
 */
uno.WebglShader.FLOAT = 8;

/**
 * Shader type to WebGL types conversion hash
 * @const
 * @type {Object}
 */
uno.WebglShader.TYPES = {
    0: 0,
    1: 1,
    2: uno.WebglConsts.BYTE,
    3: uno.WebglConsts.UNSIGNED_BYTE,
    4: uno.WebglConsts.SHORT,
    5: uno.WebglConsts.UNSIGNED_SHORT,
    6: uno.WebglConsts.INT,
    7: uno.WebglConsts.UNSIGNED_INT,
    8: uno.WebglConsts.FLOAT
};

/**
 * Shader type to sizes in bytes conversion hash
 * @const
 * @type {Object}
 */
uno.WebglShader.SIZES = {
    2: 1,
    3: 1,
    4: 2,
    5: 2,
    6: 4,
    7: 4,
    8: 4
};

/**
 * Texture ID to WebGL const conversion hash
 * @const
 * @type {Array}
 */
uno.WebglShader.TEXTURES = [
    uno.WebglConsts.TEXTURE0,
    uno.WebglConsts.TEXTURE1,
    uno.WebglConsts.TEXTURE2,
    uno.WebglConsts.TEXTURE3,
    uno.WebglConsts.TEXTURE4,
    uno.WebglConsts.TEXTURE5,
    uno.WebglConsts.TEXTURE6,
    uno.WebglConsts.TEXTURE7
];

/**
 * Matrix uniform call conversion hash
 * @const
 * @type {Object}
 */
uno.WebglShader.MATRIX = {
    2: 'uniformMatrix2fv',
    3: 'uniformMatrix3fv',
    4: 'uniformMatrix4fv'
};

/**
 * Float uniform call conversion hash
 * @const
 * @type {Object}
 */
uno.WebglShader.UNIFORM_F = {
    1: 'uniform1fv',
    2: 'uniform2fv',
    3: 'uniform3fv',
    4: 'uniform4fv'
};

/**
 * Integer uniform call conversion hash
 * @const
 * @type {Object}
 */
uno.WebglShader.UNIFORM_I = {
    1: 'uniform1iv',
    2: 'uniform2iv',
    3: 'uniform3iv',
    4: 'uniform4iv'
};

/**
 * Free all allocated resources and destroy shader
 */
uno.WebglShader.prototype.destroy = function() {
    this._render._removeRestore(this);
    this._free();
    this._render = null;
    this._settings = null;
    this._program = null;
    this._attributes = null;
    this._uniforms = null;
    this._size = 0;
};

/**
 * Lose method for handling context loosing
 * @private
 */
uno.WebglShader.prototype._lose = function() {
    this._free();
};

/**
 * Free shader resources
 * @private
 */
uno.WebglShader.prototype._free = function() {
    var ctx = this._render._context;
    ctx.deleteProgram(this._program);
    ctx.deleteShader(this._vertex);
    ctx.deleteShader(this._fragment);
    this._program = null;
    this._vertex = null;
    this._fragment = null;
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglShader.prototype._restore = function() {
    var ctx = this._render._context;
    var settings = this._settings;
    var program = this._createProgram(settings.vertex, settings.fragment);

    ctx.useProgram(program);

    this._attributes = [];
    this._uniforms = [];
    var name, params, value;
    this._size = 0;

    for (name in settings.attributes) {
        params = settings.attributes[name];
        this._attributes.push(name);
        value = {};
        value.location = ctx.getAttribLocation(program, name);
        value.type = uno.WebglShader.TYPES[params.type];
        value.size = params.size || 1;
        value.normalize = !!params.normalize;
        value.bytes = uno.WebglShader.SIZES[params.type] * value.size;
        this._size += value.bytes;
        this[name] = value;
    }

    for (name in settings.uniforms) {
        params = settings.uniforms[name];
        this._uniforms.push(name);
        value = {};
        value.location = ctx.getUniformLocation(program, name);
        value.type = uno.WebglShader.TYPES[params.type];
        value.size = params.size;
        value.values = this.setUniformValues.bind(this, value);
        value.vector = this.setUniformVector.bind(this, value);
        value.matrix = this.setUniformMatrix.bind(this, value);
        value.texture = this.setUniformTexture.bind(this, value);
        this[name] = value;
    }

    this._program = program;
};

/**
 * Sets uniforms from arguments
 */
uno.WebglShader.prototype.setUniformValues = function() {
    var len = arguments.length;
    if (len < 2)
        return;

    var ctx = this._render._context;
    var uniform = arguments[0];
    var type = uniform.type;

    if (type <= 1)
        return;

    if (type === uno.WebglConsts.FLOAT) {
        switch (uniform.size) {
            case 1: ctx.uniform1f(uniform.location, arguments[1]); break;
            case 2: ctx.uniform2f(uniform.location, arguments[1], arguments[2]); break;
            case 3: ctx.uniform3f(uniform.location, arguments[1], arguments[2], arguments[3]); break;
            case 4: ctx.uniform4f(uniform.location, arguments[1], arguments[2], arguments[3], arguments[4]); break;
        }
    } else {
        switch (uniform.size) {
            case 1: ctx.uniform1i(uniform.location, arguments[1]); break;
            case 2: ctx.uniform2i(uniform.location, arguments[1], arguments[2]); break;
            case 3: ctx.uniform3i(uniform.location, arguments[1], arguments[2], arguments[3]); break;
            case 4: ctx.uniform4i(uniform.location, arguments[1], arguments[2], arguments[3], arguments[4]); break;
        }
    }
};

/**
 * Set vector to uniform
 * @param {Object} uniform - Uniform instance
 * @param {Array} vector - The data to set
 */
uno.WebglShader.prototype.setUniformVector = function(uniform, vector) {
    var ctx = this._render._context;
    var type = uniform.type;

    if (type <= 1)
        return;

    var conv = type === uno.WebglConsts.FLOAT ? uno.WebglShader.UNIFORM_F : uno.WebglShader.UNIFORM_I;
    ctx[conv[uniform.size]](uniform.location, vector);
};

/**
 * Set matrix to uniform
 * @param {Object} uniform - Uniform instance
 * @param {uno.Matrix} matrix - The matrix to set
 * @param {Boolean} transpose - Transponse the matrix
 */
uno.WebglShader.prototype.setUniformMatrix = function(uniform, matrix, transpose) {
    this._render._context[uno.WebglShader.MATRIX[uniform.size < 2 ? 2 : uniform.size]](
        uniform.location, transpose === true, matrix.array());
};

/**
 * Set texture to uniform
 * @param {Object} uniform - Uniform instance
 * @param {Number} index - Texture index
 * @param {WebGLTexture} texture - Texture instance
 */
uno.WebglShader.prototype.setUniformTexture = function(uniform, index, texture) {
    var ctx = this._render._context;

    ctx.activeTexture(uno.WebglShader.TEXTURES[index]);
    ctx.bindTexture(uno.WebglConsts.TEXTURE_2D, texture);
    ctx.uniform1i(uniform.location, index);
};

/**
 * Use this shader in render
 */
uno.WebglShader.prototype.use = function() {
    var ctx = this._render._context;
    var attr, offset = 0;
    var attrs = this._attributes;

    ctx.useProgram(this._program);

    for (var i = 0, l = attrs.length; i < l; ++i) {
        attr = this[attrs[i]];
        ctx.enableVertexAttribArray(attr.location);
        ctx.vertexAttribPointer(attr.location, attr.size, attr.type, attr.normalize, this._size, offset);
        offset += attr.bytes;
    }
};

/**
 * Create shader program from vertex and fragment shaders
 * @param {String|String[]} vertex - Vertex shader code
 * @param {String|String[]} fragment - Fragment shader code
 * @returns {WebGLProgram} - Shader program
 * @private
 */
uno.WebglShader.prototype._createProgram = function(vertex, fragment) {
    var ctx = this._render._context;
    var consts = uno.WebglConsts;
    var program = ctx.createProgram();

    this._vertex = this._compileShader(consts.VERTEX_SHADER, vertex);
    this._fragment = this._compileShader(consts.FRAGMENT_SHADER, fragment);

    ctx.attachShader(program, this._vertex);
    ctx.attachShader(program, this._fragment);
    ctx.linkProgram(program);

    if (!ctx.getProgramParameter(program, consts.LINK_STATUS) && !ctx.isContextLost())
        return uno.error('Program filed to link:', ctx.getProgramInfoLog(program));

    return program;
};

/**
 * Compile shader code
 * @param {Number} type - Type of the shader code (ctx.VERTEX_SHADER or ctx.FRAGMENT_SHADER)
 * @param {String|String[]} source - The shader source code
 * @returns {WebGLShader} - Compiled shader
 * @private
 */
uno.WebglShader.prototype._compileShader = function(type, source) {
    var ctx = this._render._context;
    var consts = uno.WebglConsts;
    var shader = ctx.createShader(type);

    ctx.shaderSource(shader, typeof source === 'string' ? source : source.join('\n'));
    ctx.compileShader(shader);

    if (!ctx.getShaderParameter(shader, consts.COMPILE_STATUS) && !ctx.isContextLost())
        return uno.error('Could not compile shader:', ctx.getShaderInfoLog(shader));

    return shader;
};