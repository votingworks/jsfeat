import data_t from './data_t'
import { get_data_type, get_channel, U8_t, S32_t, F32_t, get_data_type_size } from '../jsfeat_struct'

// columns, rows, data_type
export default class matrix_t {
    /**
     * @param {number} c
     * @param {number} r
     * @param {number} data_type
     * @param {data_t=} data_buffer
     */
    constructor(c, r, data_type, data_buffer) {
        this.type = get_data_type(data_type)|0;
        /**
         * @type {number}
         */
        this.channel = get_channel(data_type)|0;
        this.cols = c|0;
        this.rows = r|0;
        if (typeof data_buffer === "undefined") { 
            this.allocate();
        } else {
            this.buffer = data_buffer;
            // data user asked for
            this.data = /** @type {import('../jsfeat_struct').Data} */(this.type&U8_t ? this.buffer.u8 : (this.type&S32_t ? this.buffer.i32 : (this.type&F32_t ? this.buffer.f32 : this.buffer.f64)));
        }
    }

    allocate() {
        // clear references
        delete this.data;
        delete this.buffer;
        //
        this.buffer = new data_t((this.cols * get_data_type_size(this.type) * this.channel) * this.rows);
        this.data = this.type&U8_t ? this.buffer.u8 : (this.type&S32_t ? this.buffer.i32 : (this.type&F32_t ? this.buffer.f32 : this.buffer.f64));
    }

    /**
     * @param {matrix_t} other
     */
    copy_to(other) {
        var od = other.data, td = this.data;
        var i = 0, n = (this.cols*this.rows*this.channel)|0;
        for(; i < n-4; i+=4) {
            od[i] = td[i];
            od[i+1] = td[i+1];
            od[i+2] = td[i+2];
            od[i+3] = td[i+3];
        }
        for(; i < n; ++i) {
            od[i] = td[i];
        }
    }

    /**
     * @param {number} c
     * @param {number} r
     * @param {number=} ch
     */
    resize(c, r, ch) {
        if (typeof ch === "undefined") { ch = this.channel; }
        // relocate buffer only if new size doesnt fit
        var new_size = (c * get_data_type_size(this.type) * ch) * r;
        if(new_size > this.buffer.size) {
            this.cols = c;
            this.rows = r;
            this.channel = ch;
            this.allocate();
        } else {
            this.cols = c;
            this.rows = r;
            this.channel = ch;
        }
    }
}
