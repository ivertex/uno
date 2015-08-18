/**
 * Shader for rendering in sprite batch
 * @property {Object} SPRITE
 * @property {String} SPRITE.name - Name of the shader
 * @property {String[]} SPRITE.fragment - Fragment shader
 * @property {String[]} SPRITE.vertex - Vertex shader
 * @property {Object} SPRITE.override - Shader types overrides
 */
uno.WebglShader.SPRITE = {
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
    attributes: {
        order: ['aPosition', 'aUV', 'aColor'],
        override: {
            aColor: { type: uno.WebglConsts.UNSIGNED_BYTE, size: 4, normalize: true }
        }
    }
};