/**
 * Primitive shader for rendering shapes in graphics batch
 * @property {Object} GRAPHICS
 * @property {String} GRAPHICS.name - Name of the shader
 * @property {String[]} GRAPHICS.fragment - Fragment shader
 * @property {String[]} GRAPHICS.vertex - Vertex shader
 * @property {Object} GRAPHICS.attributes - Vertex shader attributes
 */
uno.WebglShader.GRAPHICS = {
    name: 'graphics',
    fragment: [
        'precision mediump float;',
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
    attributes: [
        { name: 'aPosition', type: uno.WebglConsts.FLOAT_VEC2 },
        { name: 'aColor', type: uno.WebglConsts.UNSIGNED_BYTE, size: 4, normalize: true } // Using packing ABGR (alpha and tint color)
    ]
};