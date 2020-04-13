/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 * Copyright 2007 Computer Vision Lab,
 * Ecole Polytechnique Federale de Lausanne (EPFL), Switzerland.
 * @author Vincent Lepetit (http://cvlab.epfl.ch/~lepetit)
 */

import * as cache from './jsfeat_cache'

/**
 * @typedef {import('./jsfeat').Point} Point
 * @typedef {import('./jsfeat_struct').Data} Data
 * @typedef {import('./jsfeat_struct/matrix_t').default} matrix_t
 */

/**
 * @template {Data} T
 * @param {T} src
 * @param {T} dst
 * @param {number} w
 * @param {number} h
 * @param {number} Dxx
 * @param {number} Dyy
 * @param {number} sx
 * @param {number} sy
 * @param {number} ex
 * @param {number} ey
 */
var compute_laplacian = function(src, dst, w, h, Dxx, Dyy, sx,sy, ex,ey) {
    var y=0,x=0,yrow=(sy*w+sx)|0,row=yrow;

    for(y = sy; y < ey; ++y, yrow+=w, row = yrow) {
        for(x = sx; x < ex; ++x, ++row) {
            dst[row] = -4 * src[row] + src[row+Dxx] + src[row-Dxx] + src[row+Dyy] + src[row-Dyy];
        }
    }
}

/**
 * @param {Data} src
 * @param {number} off
 * @param {number} tr
 * @param {number} Dxx
 * @param {number} Dyy
 * @param {number} Dxy
 * @param {number} Dyx
 * @returns {number}
 */
var hessian_min_eigen_value = function(src, off, tr, Dxx, Dyy, Dxy, Dyx) {
    var Ixx = -2 * src[off] + src[off + Dxx] + src[off - Dxx];
    var Iyy = -2 * src[off] + src[off + Dyy] + src[off - Dyy];
    var Ixy = src[off + Dxy] + src[off - Dxy] - src[off + Dyx] - src[off - Dyx];
    var sqrt_delta = ( Math.sqrt(((Ixx - Iyy) * (Ixx - Iyy) + 4 * Ixy * Ixy) ) )|0;

    return Math.min(Math.abs(tr - sqrt_delta), Math.abs(-(tr + sqrt_delta)));
}



export const laplacian_threshold = 30;
export const min_eigen_value_threshold = 25;

/**
 * @param {matrix_t} src
 * @param {Point[]} points
 * @param {number} border
 * @returns {number}
 */
export const detect = function(src, points, border) {
    if (typeof border === "undefined") { border = 5; }
    var x=0,y=0;
    var w=src.cols, h=src.rows, srd_d=src.data;
    var Dxx = 5, Dyy = (5 * w)|0;
    var Dxy = (3 + 3 * w)|0, Dyx = (3 - 3 * w)|0;
    var lap_buf = cache.get_buffer((w*h)<<2);
    var laplacian = lap_buf.i32;
    var lv=0, row=0,rowx=0,min_eigen_value=0,pt;
    var number_of_points = 0;
    var lap_thresh = laplacian_threshold;
    var eigen_thresh = min_eigen_value_threshold;

    var sx = Math.max(5, border)|0;
    var sy = Math.max(3, border)|0;
    var ex = Math.min(w-5, w-border)|0;
    var ey = Math.min(h-3, h-border)|0;

    x = w*h;
    while(--x>=0) {laplacian[x]=0;}
    compute_laplacian(srd_d, laplacian, w, h, Dxx, Dyy, sx,sy, ex,ey);

    row = (sy*w+sx)|0;
    for(y = sy; y < ey; ++y, row += w) {
        for(x = sx, rowx=row; x < ex; ++x, ++rowx) {

            lv = laplacian[rowx];
            if ((lv < -lap_thresh &&
                lv < laplacian[rowx - 1]      && lv < laplacian[rowx + 1] &&
                lv < laplacian[rowx - w]     && lv < laplacian[rowx + w] &&
                lv < laplacian[rowx - w - 1] && lv < laplacian[rowx + w - 1] &&
                lv < laplacian[rowx - w + 1] && lv < laplacian[rowx + w + 1])
                ||
                (lv > lap_thresh &&
                lv > laplacian[rowx - 1]      && lv > laplacian[rowx + 1] &&
                lv > laplacian[rowx - w]     && lv > laplacian[rowx + w] &&
                lv > laplacian[rowx - w - 1] && lv > laplacian[rowx + w - 1] &&
                lv > laplacian[rowx - w + 1] && lv > laplacian[rowx + w + 1])
                ) {

                min_eigen_value = hessian_min_eigen_value(srd_d, rowx, lv, Dxx, Dyy, Dxy, Dyx);
                if (min_eigen_value > eigen_thresh) {
                    pt = points[number_of_points];
                    pt.x = x, pt.y = y, pt.score = min_eigen_value;
                    ++number_of_points;
                    ++x, ++rowx; // skip next pixel since this is maxima in 3x3
                }
            }
        }
    }

    cache.put_buffer(lap_buf);

    return number_of_points;
}
