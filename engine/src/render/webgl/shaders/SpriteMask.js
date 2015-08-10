/**
 * Shader for rendering in sprite batch
 * @property {Object} default
 * @property {String} default.name - Name of the shader
 * @property {String[]} default.fragment - Fragment shader
 * @property {String[]} default.vertex - Vertex shader
 * @property {Object} default.attributes - Shader attributes
 * @property {Object} default.uniforms - Shader uniforms
 */
uno.WebglShader.SPRITE_MASK = {
    name: 'sprite_mask',
    fragment: [
        'precision lowp float;',
        'varying vec2 vUV;',
        'varying vec4 vColor;',
        'uniform sampler2D uSampler;',
        'uniform sampler2D uMask;',
        'uniform mat3 uMaskTransform;',
        'uniform vec2 uMaskSize;',

        'void main(void) {',
        '   vec4 color = texture2D(uSampler, vUV) * vColor;',
        '   vec2 coords = (gl_FragCoord.xyz * uMaskTransform).xy / uMaskSize;',
        '   if (coords.x < 0.0 || coords.y < 0.0 || coords.x > 1.0 || coords.y > 1.0) discard;',
        '   float alpha = color.a * texture2D(uMask, coords).a;',
        '   if (alpha < 0.01) discard;',
        '   gl_FragColor = vec4(color.rgb * alpha, alpha);',
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
        aPosition: { type: uno.WebglShader.FLOAT, size: 2 },
        aUV: { type: uno.WebglShader.FLOAT, size: 2 },
        aColor: { type: uno.WebglShader.UNSIGNED_BYTE, size: 4, normalize: true }   // Using packing ABGR (alpha and tint color)
    },
    uniforms: {
        uProjection: { type: uno.WebglShader.FLOAT, size: 2 },
        uMaskTransform: { type: uno.WebglShader.MATRIX, size: 3 },
        uMaskSize: { type: uno.WebglShader.FLOAT, size: 2 },
        uSampler: { type: uno.WebglShader.SAMPLER },
        uMask: { type: uno.WebglShader.SAMPLER }
    }
};