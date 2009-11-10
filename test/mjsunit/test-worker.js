process.mixin(require("./common"));

var sys = require("sys");
var Worker = require("worker").Worker;

process.ENV["NODE_PATH"] = process.libDir;

var worker = new Worker(__filename.replace("test-", "fixtures/"));

worker.onmessage = function (msg) {
  if (msg.input) {
    assertEquals(msg.output, msg.input * 3);
    sys.error("Good");
  }
}

worker.addListener("message", function (msg) {
  if (msg == "terminate") {
    worker.terminate();
  }
})

worker.postMessage({
  input: 1
});
worker.postMessage({
  input: 2
});
setTimeout(function () {
  worker.postMessage("terminate");
}, 1000);