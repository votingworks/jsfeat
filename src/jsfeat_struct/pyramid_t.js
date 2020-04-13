import * as imgproc from '../jsfeat_imgproc'
import matrix_t from './matrix_t'

export default class pyramid_t {
    /**
     * @param {number} levels
     */
    constructor(levels) {
        this.levels = levels|0;
        this.data = new Array(levels);
        this.pyrdown = imgproc.pyrdown;
    }

    /**
     * @param {number} start_w
     * @param {number} start_h
     * @param {number} data_type
     */
    allocate(start_w, start_h, data_type) {
        var i = this.levels;
        while(--i >= 0) {
            this.data[i] = new matrix_t(start_w >> i, start_h >> i, data_type);
        }
    }

    /**
     * @param {matrix_t} input
     * @param {boolean=} skip_first_level
     */
    build(input, skip_first_level) {
        if (typeof skip_first_level === "undefined") { skip_first_level = true; }
        // just copy data to first level
        var i = 2, a = input, b = this.data[0];
        if(!skip_first_level) {
            var j=input.cols*input.rows;
            while(--j >= 0) {
                b.data[j] = input.data[j];
            }
        }
        b = this.data[1];
        this.pyrdown(a, b);
        for(; i < this.levels; ++i) {
            a = b;
            b = this.data[i];
            this.pyrdown(a, b);
        }
    }
}
