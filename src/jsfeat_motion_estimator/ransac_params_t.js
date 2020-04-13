/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 */
export default class ransac_params_t {
    /**
     * @param {number=} size
     * @param {number=} thresh
     * @param {number=} eps
     * @param {number=} prob
     */
    constructor(size, thresh, eps, prob) {
        if (typeof size === "undefined") { size=0; }
        if (typeof thresh === "undefined") { thresh=0.5; }
        if (typeof eps === "undefined") { eps=0.5; }
        if (typeof prob === "undefined") { prob=0.99; }

        this.size = size;
        this.thresh = thresh;
        this.eps = eps;
        this.prob = prob;
    }

    /**
     * @param {number} _eps
     * @param {number} max_iters
     */
    update_iters(_eps, max_iters) {
        var num = Math.log(1 - this.prob);
        var denom = Math.log(1 - Math.pow(1 - _eps, this.size));
        return (denom >= 0 || -num >= max_iters*(-denom) ? max_iters : Math.round(num/denom))|0;
    }
}
