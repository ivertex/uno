/**
 * WebGL shader implementation
 * @param {uno.WebglRender} render - WebGL render instance
 * @param {Object} settings - Shader settings
 * @constructor
 * @ignore
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

    /**
     * List of attributes names
     * @type {Array}
     * @private
     */
    this._attributes = [];

    /**
     * List of uniforms names
     * @type {Array}
     * @private
     */
    this._uniforms = [];

    /**
     * Stride
     * @type {number}
     * @private
     */
    this._stride = 0;

    this._restore();

    render._addRestore(this);
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
 * Types information
 * @const
 * @type {Object}
 */
uno.WebglShader.TYPES = {
    35670:  { type: uno.WebglConsts.BOOL, bytes: 1, size: 1 },
    35671:  { type: uno.WebglConsts.BOOL, bytes: 1, size: 2 },
    35672:  { type: uno.WebglConsts.BOOL, bytes: 1, size: 3 },
    35673:  { type: uno.WebglConsts.BOOL, bytes: 1, size: 4 },
    5120:   { type: uno.WebglConsts.BYTE, bytes: 1, size: 1 },
    5121:   { type: uno.WebglConsts.UNSIGNED_BYTE, bytes: 1, size: 1 },
    5122:   { type: uno.WebglConsts.SHORT, bytes: 2, size: 1 },
    5123:   { type: uno.WebglConsts.UNSIGNED_SHORT, bytes: 2, size: 1 },
    5124:   { type: uno.WebglConsts.INT, bytes: 4, size: 1 },
    5125:   { type: uno.WebglConsts.UNSIGNED_INT, bytes: 4, size: 1 },
    5126:   { type: uno.WebglConsts.FLOAT, bytes: 4, size: 1 },
    35665:  { type: uno.WebglConsts.FLOAT, bytes: 4, size: 3 },
    35666:  { type: uno.WebglConsts.FLOAT, bytes: 4, size: 4 },
    35667:  { type: uno.WebglConsts.INT, bytes: 4, size: 2 },
    35668:  { type: uno.WebglConsts.INT, bytes: 4, size: 2 },
    35669:  { type: uno.WebglConsts.INT, bytes: 4, size: 2 },
    35664:  { type: uno.WebglConsts.FLOAT, bytes: 4, size: 2 },
    35674:  { type: uno.WebglConsts.FLOAT, bytes: 4, size: 4 },
    35675:  { type: uno.WebglConsts.FLOAT, bytes: 4, size: 9 },
    35676:  { type: uno.WebglConsts.FLOAT, bytes: 4, size: 16 }
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
};

/**
 * Use this shader in render
 */
uno.WebglShader.prototype.use = function() {
    var ctx = this._render._context;
    var attr, offset = 0, stride = this._stride;
    var attrs = this._attributes;

    ctx.useProgram(this._program);

    for (var i = 0, l = attrs.length; i < l; ++i) {
        attr = this[attrs[i]];
        ctx.enableVertexAttribArray(attr.location);
        ctx.vertexAttribPointer(attr.location, attr.size, attr.item, attr.normalize, stride, offset);
        offset += attr.bytes;
    }
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
    this._stride = 0;

    var i, l, items, item;

    // Attributes should be in valid order, use settings
    items = settings.attributes;

    for (i = 0, l = items.length; i < l; ++i) {
        item = this._createAttribute(ctx, program, items[i]);
        this._stride += item.bytes;
        this[item.name] = item;
        this._attributes.push(item.name);
    }

    l = ctx.getProgramParameter(program, ctx.ACTIVE_UNIFORMS);
    for (i = 0; i < l; ++i) {
        item = this._createUniform(ctx, settings, program, i);
        this[item.name] = item;
        this._uniforms.push(item.name);
    }

    this._program = program;
};

/**
 * Create new attribute
 * @param {WebGLRenderingContext} ctx - Render context
 * @param {WebGLProgram} program - Compiled program
 * @param {Object} settings - Shader settings
 * @returns {Object}
 * @private
 */
uno.WebglShader.prototype._createAttribute = function(ctx, program, settings) {
    var info = uno.WebglShader.TYPES[settings.type];
    var item = {};

    item.name = settings.name;
    item.type = settings.type;
    item.location = ctx.getAttribLocation(program, item.name);
    item.size = (settings.size || 1) * info.size;
    item.item = info.type;
    item.bytes = info.bytes * item.size;
    item.normalize = settings.normalize === true;

    return item;
};

/**
 * Create new uniform
 * @param {WebGLRenderingContext} ctx - Render context
 * @param {Object} settings - Shader settings
 * @param {WebGLProgram} program - Compiled program
 * @param {Number} index - Index of uniform
 * @returns {Object}
 * @private
 */
uno.WebglShader.prototype._createUniform = function(ctx, settings, program, index) {
    var params = ctx.getActiveUniform(program, index);
    var name = params.name;

    var i = name.indexOf('[');
    if (i !== -1)
        name = name.substr(0, i);

    var item = {};

    item.name = name;
    item.location = ctx.getUniformLocation(program, name);
    item.type = params.type;
    item.size = params.size;
    item.last = null;
    item.set = this._setUniform.bind(this, item);

    return item;
};

/**
 * Set vector to uniform
 * @param {Object} uniform - Uniform
 * @param {Array|WebGLTexture|uno.Point|uno.Rect} param1 - The data or texture to set
 * @param {Boolean|Number} param2 - For matrix - transpose, for texture - index
 * @private
 */
uno.WebglShader.prototype._setUniform = function(uniform, param1, param2) {
    var ctx = this._render._context;
    var consts = uno.WebglConsts;

    switch (uniform.type) {
        case consts.BOOL:
        case consts.BYTE:
        case consts.UNSIGNED_BYTE:
        case consts.SHORT:
        case consts.UNSIGNED_SHORT:
        case consts.INT:
        case consts.UNSIGNED_INT:
            if (uniform.last !== param1) {
                ctx.uniform1i(uniform.location, param1);
                uniform.last = param1;
            }
            break;
        case consts.BOOL_VEC2:
        case consts.INT_VEC2:
            if (param1 instanceof uno.Point)
                ctx.uniform2i(uniform.location, param1.x, param1.y);
            else
                ctx.uniform2iv(uniform.location, param1);
            break;
        case consts.BOOL_VEC3:
        case consts.INT_VEC3:
            ctx.uniform3iv(uniform.location, param1);
            break;
        case consts.BOOL_VEC4:
        case consts.INT_VEC4:
            if (param1 instanceof uno.Rect)
                ctx.uniform4i(uniform.location, param1.x, param1.y, param1.width, param1.height);
            else
                ctx.uniform4iv(uniform.location, param1);
            break;
        case consts.FLOAT:
            ctx.uniform1f(uniform.location, param1);
            break;
        case consts.FLOAT_VEC2:
            if (param1 instanceof uno.Point)
                ctx.uniform2f(uniform.location, param1.x, param1.y);
            else
                ctx.uniform2fv(uniform.location, param1);
            break;
        case consts.FLOAT_VEC3:
            ctx.uniform3fv(uniform.location, param1);
            break;
        case consts.FLOAT_VEC4:
            if (param1 instanceof uno.Rect)
                ctx.uniform4f(uniform.location, param1.x, param1.y, param1.width, param1.height);
            else
                ctx.uniform4fv(uniform.location, param1);
            break;
        case consts.FLOAT_MAT2:
            ctx.uniformMatrix2fv(uniform.location, param2 === true, param1);
            break;
        case consts.FLOAT_MAT3:
            ctx.uniformMatrix3fv(uniform.location, param2 === true, param1 instanceof uno.Matrix ? param1.array() : param1);
            break;
        case consts.FLOAT_MAT4:
            ctx.uniformMatrix4fv(uniform.location, param2 === true, param1);
            break;
        case consts.SAMPLER_2D:
            param2 = param2 || 0;
            ctx.activeTexture(uno.WebglShader.TEXTURES[param2]);
            ctx.bindTexture(uno.WebglConsts.TEXTURE_2D, param1);
            ctx.uniform1i(uniform.location, param2);
            break;
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
        throw new Error('Program filed to link:', ctx.getProgramInfoLog(program));

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
        throw new Error('Could not compile shader:', ctx.getShaderInfoLog(shader));

    return shader;
};