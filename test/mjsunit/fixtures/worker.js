process.mixin(require("../common"));

var sys    = require("sys");
var worker = require("worker").worker;

worker.onmessage = function (msg) {
    msg.output = msg.input * 3;
    worker.postMessage(msg)
};
