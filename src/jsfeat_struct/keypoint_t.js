export default class keypoint_t {
    /**
     * @param {number=} x
     * @param {number=} y 
     * @param {number=} score 
     * @param {number=} level 
     * @param {number=} angle 
     */
    constructor(x,y,score,level,angle) {
        if (typeof x === "undefined") { x=0; }
        if (typeof y === "undefined") { y=0; }
        if (typeof score === "undefined") { score=0; }
        if (typeof level === "undefined") { level=0; }
        if (typeof angle === "undefined") { angle=-1.0; }

        this.x = x;
        this.y = y;
        this.score = score;
        this.level = level;
        this.angle = angle;
    }
}
