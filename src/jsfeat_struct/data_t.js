export default class data_t {
    /**
     * @param {number} size_in_bytes
     */
    constructor(size_in_bytes) {
        // we need align size to multiple of 8
        this.size = ((size_in_bytes + 7) | 0) & -8;
        this.buffer = new ArrayBuffer(this.size);
        this.u8 = new Uint8Array(this.buffer);
        this.i32 = new Int32Array(this.buffer);
        this.f32 = new Float32Array(this.buffer);
        this.f64 = new Float64Array(this.buffer);
    }
}
