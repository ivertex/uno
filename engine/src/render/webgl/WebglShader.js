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
 * Free all allocated resources and destroy shader
 */
uno.WebglShader.prototype.destroy = function() {
    this._render._removeRestore(this);
    this._render._context.deleteProgram(this.program);
    this._render = null;
    this._settings = null;
    this._program = null;
    this._attributes = null;
    this._uniforms = null;
    this._size = 0;
};

/**
 * Restore method for handling context restoring
 * @private
 */
uno.WebglShader.prototype._restore = function() {
    var ctx = this._render._context;
    var settings = this._settings;
    var program = uno.WebglShader._createProgram(ctx, settings.vertex, settings.fragment);

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
        value.type = uno.WebglShader._getType(ctx, params[0]);
        value.count = params[1];
        value.normalized = !!params[2];
        value.size = uno.WebglShader._getSize(ctx, params[0]) * value.count;
        this._size += value.size;
        this[name] = value;
    }

    for (name in settings.uniforms) {
        params = settings.uniforms[name];
        this._uniforms.push(name);
        value = {};
        value.location = ctx.getUniformLocation(program, name);
        value.type = uno.WebglShader._getType(ctx, params[0]);
        value.count = params[1];
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

    if (type === ctx.BYTE || type === ctx.UNSIGNED_BYTE || type === ctx.SHORT ||
        type === ctx.UNSIGNED_SHORT || type === ctx.SHORT || type === ctx.INT || type === ctx.UNSIGNED_INT) {
        switch (uniform.count) {
            case 1: ctx.uniform1i(uniform.location, arguments[1]); break;
            case 2: ctx.uniform2i(uniform.location, arguments[1], arguments[2]); break;
            case 3: ctx.uniform3i(uniform.location, arguments[1], arguments[2], arguments[3]); break;
            case 4: ctx.uniform4i(uniform.location, arguments[1], arguments[2], arguments[3], arguments[4]); break;
        }
    } else if (type === ctx.FLOAT) {
        switch (uniform.count) {
            case 1: ctx.uniform1f(uniform.location, arguments[1]); break;
            case 2: ctx.uniform2f(uniform.location, arguments[1], arguments[2]); break;
            case 3: ctx.uniform3f(uniform.location, arguments[1], arguments[2], arguments[3]); break;
            case 4: ctx.uniform4f(uniform.location, arguments[1], arguments[2], arguments[3], arguments[4]); break;
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

    if (type === ctx.BYTE || type === ctx.UNSIGNED_BYTE || type === ctx.SHORT ||
        type === ctx.UNSIGNED_SHORT || type === ctx.SHORT || type === ctx.INT || type === ctx.UNSIGNED_INT) {
        ctx['uniform' + uniform.count + 'iv'](uniform.location, vector);
    } else if (type === ctx.FLOAT) {
        ctx['uniform' + uniform.count + 'if'](uniform.location, vector);
    }
};

/**
 * Set matrix to uniform
 * @param {Object} uniform - Uniform instance
 * @param {uno.Matrix} matrix - The matrix to set
 * @param {Boolean} transpose - Transponse the matrix
 */
uno.WebglShader.prototype.setUniformMatrix = function(uniform, matrix, transpose) {
    this._render._context['uniformMatrix' + Math.max(2, uniform.count) + 'fv'](
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
    ctx.activeTexture(ctx['TEXTURE' + index]);
    ctx.bindTexture(ctx.TEXTURE_2D, texture);
    ctx.uniform1i(uniform.location, index);
};

/**
 * Use this shader in render
 */
uno.WebglShader.prototype.use = function() {
    var ctx = this._render._context;
    var attr, offset = 0;

    ctx.useProgram(this._program);

    for (var i = 0, l = this._attributes.length; i < l; ++i) {
        attr = this[this._attributes[i]];
        ctx.enableVertexAttribArray(attr.location);
        ctx.vertexAttribPointer(attr.location, attr.count, attr.type, attr.normalized, this._size, offset);
        offset += attr.size;
    }
};

/**
 * Create shader program from vertex and fragment shaders
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @param {String} vertexShader - Vertex shader code
 * @param {String} fragmentShader - Fragment shader code
 * @returns {WebGLProgram} - Shader program
 * @private
 */
uno.WebglShader._createProgram = function(ctx, vertexShader, fragmentShader) {
    var program = ctx.createProgram();

    ctx.attachShader(program, uno.WebglShader._compileShader(ctx, ctx.VERTEX_SHADER, vertexShader));
    ctx.attachShader(program, uno.WebglShader._compileShader(ctx, ctx.FRAGMENT_SHADER, fragmentShader));
    ctx.linkProgram(program);

    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS) && !ctx.isContextLost())
        return uno.error('Program filed to link:', ctx.getProgramInfoLog(program));

    return program;
};

/**
 * Compile shader code
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @param {Number} type - Type of the shader code (ctx.VERTEX_SHADER or ctx.FRAGMENT_SHADER)
 * @param {String} source - The shader source code
 * @returns {WebGLShader} - Compiled shader
 * @private
 */
uno.WebglShader._compileShader = function(ctx, type, source) {
    var shader = ctx.createShader(type);

    ctx.shaderSource(shader, typeof source === 'string' ? source : source.join('\n'));
    ctx.compileShader(shader);

    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS) && !ctx.isContextLost())
        return uno.error('Could not compile shader:', ctx.getShaderInfoLog(shader));

    return shader;
};

/**
 * Size conversion helper
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @param {Number} type - Internal type
 * @returns {Number} - WebGL type
 * @private
 */
uno.WebglShader._getType = function(ctx, type) {
    switch (type) {
        case uno.WebglShader.BYTE:
            return ctx.BYTE;
        case uno.WebglShader.UNSIGNED_BYTE:
            return ctx.UNSIGNED_BYTE;
        case uno.WebglShader.SHORT:
            return ctx.SHORT;
        case uno.WebglShader.UNSIGNED_SHORT:
            return ctx.UNSIGNED_SHORT;
        case uno.WebglShader.INT:
            return ctx.INT;
        case uno.WebglShader.UNSIGNED_INT:
            return ctx.UNSIGNED_INT;
        case uno.WebglShader.FLOAT:
            return ctx.FLOAT;
        case uno.WebglShader.MATRIX:
            return type;
        case uno.WebglShader.SAMPLER:
            return type;
    }
};

/**
 * Get size in bytes of the type helper
 * @param {WebGLRenderingContext} ctx - WebGL context
 * @param {Number} type - The type
 * @returns {Number} - Size in bytes
 * @private
 */
uno.WebglShader._getSize = function(ctx, type) {
    switch (type) {
        case uno.WebglShader.BYTE:
            return 1;
        case uno.WebglShader.UNSIGNED_BYTE:
            return 1;
        case uno.WebglShader.SHORT:
            return 2;
        case uno.WebglShader.UNSIGNED_SHORT:
            return 2;
        case uno.WebglShader.INT:
            return 4;
        case uno.WebglShader.UNSIGNED_INT:
            return 4;
        case uno.WebglShader.FLOAT:
            return 4;
    }
};