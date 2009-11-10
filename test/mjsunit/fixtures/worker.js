/* TODO: Take this code duplication out when NODE_PATH in env works */
var path = require("path");

exports.testDir = path.dirname(__filename);
exports.libDir = path.join(exports.testDir, "../../../lib");

require.paths.unshift(exports.libDir);

var sys    = require("sys");
var worker = require("worker").worker;

worker.onmessage = function (msg) {
    msg.output = msg.input * 3;
    worker.postMessage(msg);
};
