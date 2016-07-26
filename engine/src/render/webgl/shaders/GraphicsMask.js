/**
 * Primitive shader for rendering shapes in graphics batch
 * @property {Object} GRAPHICS_MASK
 * @property {String} GRAPHICS_MASK.name - Name of the shader
 * @property {String[]} GRAPHICS_MASK.fragment - Fragment shader
 * @property {String[]} GRAPHICS_MASK.vertex - Vertex shader
 * @property {Object} GRAPHICS_MASK.attributes - Vertex shader attributes
 */
uno.WebglShader.GRAPHICS_MASK = {
    name: 'graphics_mask',
    fragment: [
        'precision mediump float;',
        'varying vec4 vColor;',
        'varying vec2 vMaskUV;',
        'uniform vec4 uMaskClip;',
        'uniform sampler2D uMask;',

        'void main(void) {',
        '   if (vMaskUV.x < uMaskClip.x || vMaskUV.y < uMaskClip.y || vMaskUV.x > uMaskClip.z || vMaskUV.y > uMaskClip.z) discard;',
        '   gl_FragColor = vColor * texture2D(uMask, vMaskUV).a;',
        '}'
    ],
    vertex: [
        'attribute vec2 aPosition;',
        'attribute vec4 aColor;',
        'uniform vec2 uProjection;',
        'uniform vec3 uMaskUV[4];',
        'varying vec2 vMaskUV;',
        'varying vec4 vColor;',
        'const vec2 cOffset = vec2(-1.0, 1.0);',

        'void main(void) {',
        '   gl_Position = vec4(aPosition / uProjection + cOffset, 0.0, 1.0);',
        '   float a = dot(uMaskUV[0], vec3(1.0, aPosition.x, aPosition.y));',
        '   float b = dot(uMaskUV[1], vec3(1.0, aPosition.x, aPosition.y));',
        '   vMaskUV.x = dot(uMaskUV[2], vec3(1.0, a, b));',
        '   vMaskUV.y = dot(uMaskUV[3], vec3(1.0, a, b));',
        '   vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
        '}'
    ],
    attributes: [
        { name: 'aPosition', type: uno.WebglConsts.FLOAT_VEC2 },
        { name: 'aColor', type: uno.WebglConsts.UNSIGNED_BYTE, size: 4, normalize: true } // Using packing ABGR (alpha and tint color)
    ]
};