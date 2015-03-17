/**
 * Shader for rendering in sprite batch
 * @property {Object} default
 * @property {String} default.name - Name of the shader
 * @property {String[]} default.fragment - Fragment shader
 * @property {String[]} default.vertex - Vertex shader
 * @property {Object} default.attributes - Shader attributes
 * @property {Object} default.uniforms - Shader uniforms
 */
uno.WebglShader.SPRITE = {
    name: 'sprite',
    fragment: [
        'precision lowp float;',
        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',
        'uniform sampler2D uSampler;',

        'void main(void) {',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;',
        '}'
    ],
    vertex: [
        'attribute vec2 aPosition;',
        'attribute vec2 aTextureCoord;',
        'attribute vec4 aColor;',
        'uniform vec2 uProjection;',
        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',
        'const vec2 center = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4(aPosition / uProjection + center, 0.0, 1.0);',
        '   vTextureCoord = aTextureCoord;',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ],
    attributes: {
        aPosition: [uno.WebglShader.FLOAT, 2],
        aTextureCoord: [uno.WebglShader.FLOAT, 2],
        aColor: [uno.WebglShader.UNSIGNED_BYTE, 4, true]    // Using packing ABGR (alpha and tint color)
    },
    uniforms: {
        uProjection: [uno.WebglShader.FLOAT, 2],
        uSampler: [uno.WebglShader.SAMPLER, 1]
    }
};