/**
 * @typedef {import('../jsfeat').Rect} Rect
 */

/**
 * @param {Rect} r1
 * @param {Rect} r2 
 */
var group_func = function(r1, r2) {
    var distance = (r1.width * 0.25 + 0.5)|0;

    return r2.x <= r1.x + distance &&
            r2.x >= r1.x - distance &&
            r2.y <= r1.y + distance &&
            r2.y >= r1.y - distance &&
            r2.width <= ((r1.width * 1.5 + 0.5)|0) &&
            ((r2.width * 1.5 + 0.5)|0) >= r1.width;
}

export default group_func
