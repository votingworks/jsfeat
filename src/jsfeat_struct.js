/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

// CONSTANTS
export var EPSILON = 0.0000001192092896;
export var FLT_MIN = 1E-37;

// implementation from CCV project
// currently working only with u8,s32,f32
export var U8_t = 0x0100,
    S32_t = 0x0200,
    F32_t = 0x0400,
    S64_t = 0x0800,
    F64_t = 0x1000;

export var C1_t = 0x01,
    C2_t = 0x02,
    C3_t = 0x03,
    C4_t = 0x04;

var _data_type_size = new Int32Array([ -1, 1, 4, -1, 4, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 8 ]);

export var get_data_type = (function () {
    return function(type) {
        return (type & 0xFF00);
    }
})();

export var get_channel = (function () {
    return function(type) {
        return (type & 0xFF);
    }
})();

export var get_data_type_size = (function () {
    return function(type) {
        return _data_type_size[(type & 0xFF00) >> 8];
    }
})();

// color conversion
export var COLOR_RGBA2GRAY = 0;
export var COLOR_RGB2GRAY = 1;
export var COLOR_BGRA2GRAY = 2;
export var COLOR_BGR2GRAY = 3;

// box blur option
export var BOX_BLUR_NOSCALE = 0x01;
// svd options
export var SVD_U_T = 0x01;
export var SVD_V_T = 0x02;

// popular formats
export const U8C1_t = U8_t | C1_t;
export const U8C3_t = U8_t | C3_t;
export const U8C4_t = U8_t | C4_t;

export const F32C1_t = F32_t | C1_t;
export const F32C2_t = F32_t | C2_t;
export const S32C1_t = S32_t | C1_t;
export const S32C2_t = S32_t | C2_t;
