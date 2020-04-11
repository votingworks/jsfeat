import data_t from './data_t'
import { get_data_type, get_channel, U8_t, S32_t, F32_t, get_data_type_size } from '../jsfeat_struct'

// columns, rows, data_type
export default function matrix_t(c, r, data_type, data_buffer) {
    this.type = get_data_type(data_type)|0;
    this.channel = get_channel(data_type)|0;
    this.cols = c|0;
    this.rows = r|0;
    if (typeof data_buffer === "undefined") { 
        this.allocate();
    } else {
        this.buffer = data_buffer;
        // data user asked for
        this.data = this.type&U8_t ? this.buffer.u8 : (this.type&S32_t ? this.buffer.i32 : (this.type&F32_t ? this.buffer.f32 : this.buffer.f64));
    }
}
matrix_t.prototype.allocate = function() {
    // clear references
    delete this.data;
    delete this.buffer;
    //
    this.buffer = new data_t((this.cols * get_data_type_size(this.type) * this.channel) * this.rows);
    this.data = this.type&U8_t ? this.buffer.u8 : (this.type&S32_t ? this.buffer.i32 : (this.type&F32_t ? this.buffer.f32 : this.buffer.f64));
}
matrix_t.prototype.copy_to = function(other) {
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
matrix_t.prototype.resize = function(c, r, ch) {
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
