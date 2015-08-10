/**
 * Primitive shader for rendering shapes in graphics batch
 * @property {Object} default
 * @property {String} default.name - Name of the shader
 * @property {String[]} default.fragment - Fragment shader
 * @property {String[]} default.vertex - Vertex shader
 * @property {Object} default.attributes - Shader attributes
 * @property {Object} default.uniforms - Shader uniforms
 */
uno.WebglShader.PRIMITIVE = {
    name: 'primitive',
    fragment: [
        'precision lowp float;',
        'varying vec4 vColor;',

        'void main(void) {',
        '   gl_FragColor = vColor;',
        '}'
    ],
    vertex: [
        'attribute vec2 aPosition;',
        'attribute vec4 aColor;',
        'uniform vec2 uProjection;',
        'varying vec4 vColor;',
        'const vec2 cOffset = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4(aPosition / uProjection + cOffset, 0.0, 1.0);',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ],
    attributes: {
        aPosition: { type: uno.WebglShader.FLOAT, size: 2 },
        aColor: { type: uno.WebglShader.UNSIGNED_BYTE, size: 4, normalize: true }   // Using packing ABGR (alpha and tint color)
    },
    uniforms: {
        uProjection: { type: uno.WebglShader.FLOAT, size: 2 },
        uOffset: { type: uno.WebglShader.FLOAT, size: 2 }
    }
};