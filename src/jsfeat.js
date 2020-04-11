/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */

import "./jsfeat_struct";
import "./jsfeat_cache";
import "./jsfeat_math";
import * as matmath from "./jsfeat_mat_math";
import "./jsfeat_linalg";
import "./jsfeat_motion_estimator";
import * as imgproc from "./jsfeat_imgproc";
import * as fast_corners from "./jsfeat_fast_corners";
import "./jsfeat_yape06";
import "./jsfeat_yape";
import "./jsfeat_orb";
import * as optical_flow_lk from "./jsfeat_optical_flow_lk";
import * as haar from "./jsfeat_haar";
import "./jsfeat_bbf";

import jsfeat from "./jsfeat_namespace";

jsfeat.matmath = matmath;
jsfeat.imgproc = imgproc;
jsfeat.fast_corners = fast_corners;
jsfeat.optical_flow_lk = optical_flow_lk;
jsfeat.haar = haar;

export default jsfeat;
