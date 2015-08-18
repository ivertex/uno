/**
 * Shader for rendering in sprites batch
 * @property {Object} SPRITES
 * @property {String} SPRITES.name - Name of the shader
 * @property {String[]} SPRITES.fragment - Fragment shader
 * @property {String[]} SPRITES.vertex - Vertex shader
 * @property {Object} SPRITES.attributes - Vertex shader attributes
 */
uno.WebglShader.SPRITES = {
    name: 'sprite',
    fragment: [
        'precision lowp float;',
        'varying vec2 vUV;',
        'varying vec4 vColor;',
        'uniform sampler2D uTexture;',

        'void main(void) {',
        '   gl_FragColor = texture2D(uTexture, vUV) * vColor;',
        '}'
    ],
    vertex: [
        'attribute vec2 aPosition;',
        'attribute vec2 aUV;',
        'attribute vec4 aColor;',
        'uniform vec2 uProjection;',
        'varying vec2 vUV;',
        'varying vec4 vColor;',
        'const vec2 cOffset = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4(aPosition / uProjection + cOffset, 0.0, 1.0);',
        '   vUV = aUV;',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ],
    attributes: [
        { name: 'aPosition', type: uno.WebglConsts.FLOAT_VEC2 },
        { name: 'aUV', type: uno.WebglConsts.FLOAT_VEC2 },
        { name: 'aColor', type: uno.WebglConsts.UNSIGNED_BYTE, size: 4, normalize: true } // Using packing ABGR (alpha and tint color)
    ]
}