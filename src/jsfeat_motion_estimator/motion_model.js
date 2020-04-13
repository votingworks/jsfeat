import matrix_t from '../jsfeat_struct/matrix_t'
import * as cache from '../jsfeat_cache'
import * as linalg from '../jsfeat_linalg'
import * as matmath from '../jsfeat_mat_math'
import { C1_t, F32_t, EPSILON } from '../jsfeat_struct'

/**
 * @typedef {import('../jsfeat').Point} Point
 * @typedef {import('../jsfeat_struct').Data} Data
 */

/**
 * @param {number} x
 * @returns {number}
 */
var sqr = function(x) {
    return x*x;
}

/**
 * does isotropic normalization
 * 
 * @param {Point[]} from
 * @param {Point[]} to
 * @param {Data} T0
 * @param {Data} T1
 * @param {number} count
 */
var iso_normalize_points = function(from, to, T0, T1, count) {
    var i=0;
    var cx0=0.0, cy0=0.0, d0=0.0, s0=0.0;
    var cx1=0.0, cy1=0.0, d1=0.0, s1=0.0;
    var dx=0.0,dy=0.0;

    for (; i < count; ++i) {
        cx0 += from[i].x;
        cy0 += from[i].y;
        cx1 += to[i].x;
        cy1 += to[i].y;
    }

    cx0 /= count; cy0 /= count;
    cx1 /= count; cy1 /= count;

    for (i = 0; i < count; ++i) {
        dx = from[i].x - cx0;
        dy = from[i].y - cy0;
        d0 += Math.sqrt(dx*dx + dy*dy);
        dx = to[i].x - cx1;
        dy = to[i].y - cy1;
        d1 += Math.sqrt(dx*dx + dy*dy);
    }

    d0 /= count; d1 /= count;

    s0 = Math.SQRT2 / d0; s1 = Math.SQRT2 / d1;

    T0[0] = T0[4] = s0;
    T0[2] = -cx0*s0;
    T0[5] = -cy0*s0;
    T0[1] = T0[3] = T0[6] = T0[7] = 0.0;
    T0[8] = 1.0;

    T1[0] = T1[4] = s1;
    T1[2] = -cx1*s1;
    T1[5] = -cy1*s1;
    T1[1] = T1[3] = T1[6] = T1[7] = 0.0;
    T1[8] = 1.0;
}

var T0 = new matrix_t(3, 3, F32_t|C1_t);
var T1 = new matrix_t(3, 3, F32_t|C1_t);
var AtA = new matrix_t(6, 6, F32_t|C1_t);
var AtB = new matrix_t(6, 1, F32_t|C1_t);

/**
 * @typedef {(from: import('../jsfeat').Point[], to: import('../jsfeat').Point[], model: matrix_t, count: number) => number} MotionModelKernelRun
 */

/**
 * @typedef {(from: import('../jsfeat').Point[], to: import('../jsfeat').Point[], model: matrix_t, err: import('../jsfeat_struct').Data, count: number) => void} MotionModelKernelError
 */

/**
 * @typedef {(from: import('../jsfeat').Point[], to: import('../jsfeat').Point[], count: number) => boolean} MotionModelKernelCheckSubset
 */

/**
 * @typedef {object} MotionModelKernel
 * @property {MotionModelKernelRun} run
 * @property {MotionModelKernelError} error
 * @property {MotionModelKernelCheckSubset} check_subset
 */

/**
 * @implements {MotionModelKernel}
 */
export class affine2d {
    constructor() {
        /** @type {MotionModelKernel} */(this); // type assertion
    }

    /**
     * @param {Point[]} from
     * @param {Point[]} to
     * @param {matrix_t} model
     * @param {number} count
     * @returns {number}
     */
    run(from, to, model, count) {
        var i=0,j=0;
        var dt=model.type|C1_t;
        var md=model.data, t0d=T0.data, t1d=T1.data;
        var pt0,pt1,px=0.0,py=0.0;

        iso_normalize_points(from, to, t0d, t1d, count);

        var a_buff = cache.get_buffer((2*count*6)<<3);
        var b_buff = cache.get_buffer((2*count)<<3);

        var a_mt = new matrix_t(6, 2*count, dt, a_buff.data);
        var b_mt = new matrix_t(1, 2*count, dt, b_buff.data);
        var ad=a_mt.data, bd=b_mt.data;

        for (; i < count; ++i) {
            pt0 = from[i];
            pt1 = to[i];

            px = t0d[0]*pt0.x + t0d[1]*pt0.y + t0d[2];
            py = t0d[3]*pt0.x + t0d[4]*pt0.y + t0d[5];

            j = i*2*6;
            ad[j]=px, ad[j+1]=py, ad[j+2]=1.0, ad[j+3]=0.0, ad[j+4]=0.0, ad[j+5]=0.0;

            j += 6;
            ad[j]=0.0, ad[j+1]=0.0, ad[j+2]=0.0, ad[j+3]=px, ad[j+4]=py, ad[j+5]=1.0;

            bd[i<<1] = t1d[0]*pt1.x + t1d[1]*pt1.y + t1d[2];
            bd[(i<<1)+1] = t1d[3]*pt1.x + t1d[4]*pt1.y + t1d[5];
        }

        matmath.multiply_AtA(AtA, a_mt);
        matmath.multiply_AtB(AtB, a_mt, b_mt);

        linalg.lu_solve(AtA, AtB);

        md[0] = AtB.data[0], md[1]=AtB.data[1], md[2]=AtB.data[2];
        md[3] = AtB.data[3], md[4]=AtB.data[4], md[5]=AtB.data[5];
        md[6] = 0.0, md[7] = 0.0, md[8] = 1.0; // fill last row

        // denormalize
        matmath.invert_3x3(T1, T1);
        matmath.multiply_3x3(model, T1, model);
        matmath.multiply_3x3(model, model, T0);

        // free buffer
        cache.put_buffer(a_buff);
        cache.put_buffer(b_buff);

        return 1;
    }

    /**
     * 
     * @param {Point[]} from
     * @param {Point[]} to
     * @param {matrix_t} model
     * @param {Float32Array} err
     * @param {number} count
     */
    error(from, to, model, err, count) {
        var i=0;
        var pt0,pt1;
        var m=model.data;

        for (; i < count; ++i) {
            pt0 = from[i];
            pt1 = to[i];

            err[i] = sqr(pt1.x - m[0]*pt0.x - m[1]*pt0.y - m[2]) +
                     sqr(pt1.y - m[3]*pt0.x - m[4]*pt0.y - m[5]);
        }
    }

    check_subset() {
        return true;
    }
}

var mLtL = new matrix_t(9, 9, F32_t|C1_t);
var Evec = new matrix_t(9, 9, F32_t|C1_t);

export class homography2d {
    constructor() {
        // empty constructor
        //this.T0 = new matrix_t(3, 3, F32_t|C1_t);
        //this.T1 = new matrix_t(3, 3, F32_t|C1_t);
        //this.mLtL = new matrix_t(9, 9, F32_t|C1_t);
        //this.Evec = new matrix_t(9, 9, F32_t|C1_t);
        /** @type {MotionModelKernel} */(this); // type assertion
    }

    /**
     * @param {Point[]} from
     * @param {Point[]} to
     * @param {matrix_t} model
     * @param {number} count
     * @returns {number}
     */
    run(from, to, model, count) {
        var i=0,j=0;
        var md=model.data, t0d=T0.data, t1d=T1.data;
        var LtL=mLtL.data, evd=Evec.data;
        var x=0.0,y=0.0,X=0.0,Y=0.0;

        // norm
        var smx=0.0, smy=0.0, cmx=0.0, cmy=0.0, sMx=0.0, sMy=0.0, cMx=0.0, cMy=0.0;

        for(; i < count; ++i) {
            cmx += to[i].x;
            cmy += to[i].y;
            cMx += from[i].x;
            cMy += from[i].y;
        }

        cmx /= count; cmy /= count;
        cMx /= count; cMy /= count;

        for(i = 0; i < count; ++i)
        {
            smx += Math.abs(to[i].x - cmx);
            smy += Math.abs(to[i].y - cmy);
            sMx += Math.abs(from[i].x - cMx);
            sMy += Math.abs(from[i].y - cMy);
        }

        if( Math.abs(smx) < EPSILON 
            || Math.abs(smy) < EPSILON 
            || Math.abs(sMx) < EPSILON 
            || Math.abs(sMy) < EPSILON ) return 0;

        smx = count/smx; smy = count/smy;
        sMx = count/sMx; sMy = count/sMy;

        t0d[0] = sMx; 	t0d[1] = 0; 	t0d[2] = -cMx*sMx; 
        t0d[3] = 0; 	t0d[4] = sMy; 	t0d[5] = -cMy*sMy; 
        t0d[6] = 0; 	t0d[7] = 0; 	t0d[8] = 1;

        t1d[0] = 1.0/smx; 	t1d[1] = 0; 		t1d[2] = cmx;
        t1d[3] = 0; 		t1d[4] = 1.0/smy; 	t1d[5] = cmy;
        t1d[6] = 0; 		t1d[7] = 0; 		t1d[8] = 1;
        //

        // construct system
        i = 81;
        while(--i >= 0) {
            LtL[i] = 0.0;
        }
        for(i = 0; i < count; ++i) {
            x = (to[i].x - cmx) * smx;
            y = (to[i].y - cmy) * smy;
            X = (from[i].x - cMx) * sMx;
            Y = (from[i].y - cMy) * sMy;

            LtL[0] += X*X;
            LtL[1] += X*Y;
            LtL[2] += X;

            LtL[6] += X*-x*X;
            LtL[7] += X*-x*Y;
            LtL[8] += X*-x;
            LtL[10] += Y*Y;
            LtL[11] += Y;

            LtL[15] += Y*-x*X;
            LtL[16] += Y*-x*Y;
            LtL[17] += Y*-x;
            LtL[20] += 1.0;

            LtL[24] += -x*X;
            LtL[25] += -x*Y;
            LtL[26] += -x;
            LtL[30] += X*X;
            LtL[31] += X*Y;
            LtL[32] += X;
            LtL[33] += X*-y*X;
            LtL[34] += X*-y*Y;
            LtL[35] += X*-y;
            LtL[40] += Y*Y;
            LtL[41] += Y;
            LtL[42] += Y*-y*X;
            LtL[43] += Y*-y*Y;
            LtL[44] += Y*-y;
            LtL[50] += 1.0;
            LtL[51] += -y*X;
            LtL[52] += -y*Y;
            LtL[53] += -y;
            LtL[60] += -x*X*-x*X + -y*X*-y*X;
            LtL[61] += -x*X*-x*Y + -y*X*-y*Y;
            LtL[62] += -x*X*-x + -y*X*-y;
            LtL[70] += -x*Y*-x*Y + -y*Y*-y*Y;
            LtL[71] += -x*Y*-x + -y*Y*-y;
            LtL[80] += -x*-x + -y*-y;
        }
        //

        // symmetry
        for(i = 0; i < 9; ++i) {
            for(j = 0; j < i; ++j)
                LtL[i*9+j] = LtL[j*9+i];
        }

        linalg.eigenVV(mLtL, Evec);

        md[0]=evd[72], md[1]=evd[73], md[2]=evd[74];
        md[3]=evd[75], md[4]=evd[76], md[5]=evd[77];
        md[6]=evd[78], md[7]=evd[79], md[8]=evd[80];

        // denormalize
        matmath.multiply_3x3(model, T1, model);
        matmath.multiply_3x3(model, model, T0);

        // set bottom right to 1.0
        x = 1.0/md[8];
        md[0] *= x; md[1] *= x; md[2] *= x;
        md[3] *= x; md[4] *= x; md[5] *= x;
        md[6] *= x; md[7] *= x; md[8] = 1.0;

        return 1;
    }

    /**
     * @param {Point[]} from
     * @param {Point[]} to
     * @param {matrix_t} model
     * @param {Float32Array} err
     * @param {number} count
     */
    error(from, to, model, err, count) {
        var i=0;
        var pt0,pt1,ww=0.0,dx=0.0,dy=0.0;
        var m=model.data;

        for (; i < count; ++i) {
            pt0 = from[i];
            pt1 = to[i];

            ww = 1.0/(m[6]*pt0.x + m[7]*pt0.y + 1.0);
            dx = (m[0]*pt0.x + m[1]*pt0.y + m[2])*ww - pt1.x;
            dy = (m[3]*pt0.x + m[4]*pt0.y + m[5])*ww - pt1.y;
            err[i] = (dx*dx + dy*dy);
        }
    }

    /**
     * @param {Point[]} from
     * @param {Point[]} to
     * @param {number} count
     * @returns {boolean}
     */
    check_subset(from, to, count) {
        // seems to reject good subsets actually
        //if( have_collinear_points(from, count) || have_collinear_points(to, count) ) {
            //return false;
        //}
        if( count == 4 ) {
            var negative = 0;

            var fp0=from[0],fp1=from[1],fp2=from[2],fp3=from[3];
            var tp0=to[0],tp1=to[1],tp2=to[2],tp3=to[3];

            // set1
            var A11=fp0.x, A12=fp0.y, A13=1.0;
            var A21=fp1.x, A22=fp1.y, A23=1.0;
            var A31=fp2.x, A32=fp2.y, A33=1.0;

            var B11=tp0.x, B12=tp0.y, B13=1.0;
            var B21=tp1.x, B22=tp1.y, B23=1.0;
            var B31=tp2.x, B32=tp2.y, B33=1.0;

            var detA = matmath.determinant_3x3(A11,A12,A13, A21,A22,A23, A31,A32,A33);
            var detB = matmath.determinant_3x3(B11,B12,B13, B21,B22,B23, B31,B32,B33);

            if(detA*detB < 0) negative++;

            // set2
            A11=fp1.x, A12=fp1.y;
            A21=fp2.x, A22=fp2.y;
            A31=fp3.x, A32=fp3.y;

            B11=tp1.x, B12=tp1.y;
            B21=tp2.x, B22=tp2.y;
            B31=tp3.x, B32=tp3.y;

            detA = matmath.determinant_3x3(A11,A12,A13, A21,A22,A23, A31,A32,A33);
            detB = matmath.determinant_3x3(B11,B12,B13, B21,B22,B23, B31,B32,B33);

            if(detA*detB < 0) negative++;

            // set3
            A11=fp0.x, A12=fp0.y;
            A21=fp2.x, A22=fp2.y;
            A31=fp3.x, A32=fp3.y;

            B11=tp0.x, B12=tp0.y;
            B21=tp2.x, B22=tp2.y;
            B31=tp3.x, B32=tp3.y;

            detA = matmath.determinant_3x3(A11,A12,A13, A21,A22,A23, A31,A32,A33);
            detB = matmath.determinant_3x3(B11,B12,B13, B21,B22,B23, B31,B32,B33);

            if(detA*detB < 0) negative++;

            // set4
            A11=fp0.x, A12=fp0.y;
            A21=fp1.x, A22=fp1.y;
            A31=fp3.x, A32=fp3.y;

            B11=tp0.x, B12=tp0.y;
            B21=tp1.x, B22=tp1.y;
            B31=tp3.x, B32=tp3.y;

            detA = matmath.determinant_3x3(A11,A12,A13, A21,A22,A23, A31,A32,A33);
            detB = matmath.determinant_3x3(B11,B12,B13, B21,B22,B23, B31,B32,B33);

            if(detA*detB < 0) negative++;

            if(negative != 0 && negative != 4) {
                return false;
            }
        }
        return true; // all good
    }
}
