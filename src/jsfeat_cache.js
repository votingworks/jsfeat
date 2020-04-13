/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

import data_t from './jsfeat_struct/data_t'

// very primitive array cache, still need testing if it helps
// of course V8 has its own powerful cache sys but i'm not sure
// it caches several multichannel 640x480 buffer creations each frame

class _pool_node_t {
    /**
     * @param {number} size_in_bytes
     */
    constructor(size_in_bytes) {
        /**
         * @type {_pool_node_t | undefined}
         */
        this.next = undefined;
        this.data = new data_t(size_in_bytes);
        this.size = this.data.size;
        this.buffer = this.data.buffer;
        this.u8 = this.data.u8;
        this.i32 = this.data.i32;
        this.f32 = this.data.f32;
        this.f64 = this.data.f64;
    }
}

/**
 * @type {_pool_node_t}
 */
var _pool_head;

/**
 * @type {_pool_node_t}
 */
var _pool_tail;

/**
 * @param {number} capacity
 * @param {number} data_size
 */
export const allocate = function(capacity, data_size) {
    _pool_head = _pool_tail = new _pool_node_t(data_size);
    for (var i = 0; i < capacity; ++i) {
        var node = new _pool_node_t(data_size);
        _pool_tail = _pool_tail.next = node;
    }
}

/**
 * @param {number} size_in_bytes
 * @returns {_pool_node_t}
 */
export const get_buffer = function(size_in_bytes) {
    // assume we have enough free nodes
    var node = _pool_head;

    if (size_in_bytes > node.size) {
        throw new Error(`buffer size (${node.size}) is not big enough, requested ${size_in_bytes}`)
    }

    if (!node.next) {
        throw new Error('ran out of buffers')
    }

    _pool_head = node.next;

    return node;
}

/**
 * @param {_pool_node_t} node
 */
export const put_buffer = function(node) {
    _pool_tail = _pool_tail.next = node;
}

// for now we dont need more than 30 buffers
// if having cache sys really helps we can add auto extending sys
allocate(30, 640*4);
