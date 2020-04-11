/**
 * @author Eugene Zatepyakin / http://inspirit.ru/
 */
const jsfeat = { REVISION: "ALPHA" }

import data_t from "./jsfeat_struct/data_t";
jsfeat.data_t = data_t;

import keypoint_t from "./jsfeat_struct/keypoint_t";
jsfeat.keypoint_t = keypoint_t;

import matrix_t from "./jsfeat_struct/matrix_t";
jsfeat.matrix_t = matrix_t;

import pyramid_t from "./jsfeat_struct/pyramid_t";
jsfeat.pyramid_t = pyramid_t;

import * as cache from "./jsfeat_cache";
jsfeat.cache = cache;

import * as math from "./jsfeat_math";
jsfeat.math = math;

import * as matmath from "./jsfeat_mat_math";
jsfeat.matmath = matmath;

import * as linalg from "./jsfeat_linalg";
jsfeat.linalg = linalg;

import * as motion_estimator from "./jsfeat_motion_estimator/motion_estimator";
jsfeat.motion_esimtator = motion_estimator;

import * as motion_model from "./jsfeat_motion_estimator/motion_model";
jsfeat.motion_model = motion_model;

import * as ransac_params_t from "./jsfeat_motion_estimator/ransac_params_t";
jsfeat.ransac_params_t = ransac_params_t;

import * as imgproc from "./jsfeat_imgproc";
jsfeat.imgproc = imgproc;

import * as fast_corners from "./jsfeat_fast_corners";
jsfeat.fast_corners = fast_corners;

import * as yape06 from "./jsfeat_yape06";
jsfeat.yape06 = yape06;

import * as yape from "./jsfeat_yape";
jsfeat.yape = yape;

import * as orb from "./jsfeat_orb";
jsfeat.orb = orb;

import * as optical_flow_lk from "./jsfeat_optical_flow_lk";
jsfeat.optical_flow_lk = optical_flow_lk;

import * as haar from "./jsfeat_haar";
jsfeat.haar = haar;

import * as bbf from "./jsfeat_bbf";
jsfeat.bbf = bbf;

export default jsfeat;
