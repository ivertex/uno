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
        'varying vec2 vMaskUV;',
        'uniform sampler2D uSampler;',
        'uniform sampler2D uMask;',
        'uniform vec2 uMaskSize;',
        //'uniform mat3 uMaskTransform;',
        'uniform vec2 uViewport;',

        'void main(void) {',
        //'   vec4 color = texture2D(uSampler, vUV) * vColor;',
        //'   vec2 coords = gl_FragCoord.xy;',
        //'   coords.y = uViewport.y - coords.y;',
        //'   coords = (vec3(coords, 1.0) * uMaskTransform).xy;',
        //'   coords /= gl_FragCoord.z;',
        //'   coords /= uMaskSize * 2.0 - 1.0;',
        //'   coords.y *= -1.0;',
        //'   if (coords.x < 0.0 || coords.y < 0.0 || coords.x > 1.0 || coords.y > 1.0) discard;',
        //'   float alpha = color.a * texture2D(uMask, coords).a;',
        //'   if (alpha == 0.0) discard;',
        //'   gl_FragColor = vec4(color.rgb * alpha, alpha);',

        '   vec2 text = abs(vMaskUV - 0.5);',
        '   text = step(0.5, text);',
        '   float clip = 1.0 - max(text.y, text.x);',
        '   vec4 original = texture2D(uSampler, vUV);',
        '   vec4 mask = texture2D(uMask, vMaskUV);',
        '   original *= mask.a;',
        '   gl_FragColor = original;',
        '}'
    ],
    vertex: [
        'attribute vec2 aPosition;',
        'attribute vec2 aUV;',
        'attribute vec4 aColor;',
        'uniform vec2 uProjection;',
        'uniform mat3 uMaskTransform;',
        'varying vec2 vUV;',
        'varying vec4 vColor;',
        'varying vec2 vMaskUV;',
        'const vec2 cOffset = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4(aPosition / uProjection + cOffset, 0.0, 1.0);',
        '   vUV = aUV;',
        '   vMaskUV = (vec3(aUV, 1.0) * uMaskTransform).xy;',
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
        uViewport: { type: uno.WebglShader.FLOAT, size: 2 },
        uSampler: { type: uno.WebglShader.SAMPLER },
        uMask: { type: uno.WebglShader.SAMPLER }
    }
};