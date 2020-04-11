/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 *
 */
export function ransac_params_t(size, thresh, eps, prob) {
    if (typeof size === "undefined") { size=0; }
    if (typeof thresh === "undefined") { thresh=0.5; }
    if (typeof eps === "undefined") { eps=0.5; }
    if (typeof prob === "undefined") { prob=0.99; }

    this.size = size;
    this.thresh = thresh;
    this.eps = eps;
    this.prob = prob;
}
ransac_params_t.prototype.update_iters = function(_eps, max_iters) {
    var num = Math.log(1 - this.prob);
    var denom = Math.log(1 - Math.pow(1 - _eps, this.size));
    return (denom >= 0 || -num >= max_iters*(-denom) ? max_iters : Math.round(num/denom))|0;
};
