/* TODO: Take this code duplication out when NODE_PATH in env works */
var path = require("path");

exports.testDir = path.dirname(__filename);
exports.libDir = path.join(exports.testDir, "../../../lib");

require.paths.unshift(exports.libDir);

var sys    = require("sys");
var worker = require("worker").worker;

worker.onmessage = function (msg) {
    sys.error("OnMessage " +JSON.stringify(msg));
    
    if(msg.fib) {
      worker.postMessage(fib(msg.fib*1));
      return;
    }
    
    if(msg.wait) {
      setTimeout(function () {
        worker.postMessage("Waited")
      }, 1000)
      return;
    }
    
    if(msg.error) {
      throw("ErrorMarker");
    }
    
    msg.output = msg.input * 3;
    worker.postMessage(msg);
};


function fib(n) {
  return n < 2 ? n : fib(n-1)+fib(n-2);
}