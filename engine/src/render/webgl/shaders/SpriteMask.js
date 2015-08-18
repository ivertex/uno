/**
 * Shader for rendering in sprite batch with alpha masking
 * @property {Object} SPRITE_MASK
 * @property {String} SPRITE_MASK.name - Name of the shader
 * @property {String[]} SPRITE_MASK.fragment - Fragment shader
 * @property {String[]} SPRITE_MASK.vertex - Vertex shader
 * @property {Object} SPRITE_MASK.override - Shader types overrides
 */
uno.WebglShader.SPRITE_MASK = {
    name: 'sprite_mask',
    fragment: [
        'precision lowp float;',
        'varying vec2 vUV;',
        'varying vec4 vColor;',
        'varying vec2 vMaskUV;',
        'uniform vec4 uClip;',
        'uniform sampler2D uTexture;',
        'uniform sampler2D uMask;',

        'void main(void) {',
        '   if (vMaskUV.x < uClip.x || vMaskUV.y < uClip.y || vMaskUV.x > uClip.z || vMaskUV.y > uClip.z) discard;',
        '   gl_FragColor = texture2D(uTexture, vUV) * vColor * texture2D(uMask, vMaskUV).a;',
        '}'
    ],
    vertex: [
        'attribute vec2 aPosition;',
        'attribute vec2 aUV;',
        'attribute vec4 aColor;',
        'uniform vec2 uProjection;',
        'uniform vec3 uMaskUV[4];',
        'varying vec2 vUV;',
        'varying vec2 vMaskUV;',
        'varying vec4 vColor;',
        'const vec2 cOffset = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4(aPosition / uProjection + cOffset, 0.0, 1.0);',
        '   vUV = aUV;',
        '   float a = dot(uMaskUV[0], vec3(1.0, aPosition.x, aPosition.y));',
        '   float b = dot(uMaskUV[1], vec3(1.0, aPosition.x, aPosition.y));',
        '   vMaskUV.x = dot(uMaskUV[2], vec3(1.0, a, b));',
        '   vMaskUV.y = dot(uMaskUV[3], vec3(1.0, a, b));',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ],
    override: {
        aColor: { type: uno.WebglConsts.UNSIGNED_BYTE, size: 4, normalize: true }   // Using packing ABGR (alpha and tint color)
    }
};