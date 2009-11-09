process.mixin(require("./common"));

var sys = require("sys");
var Worker = require("worker").Worker;

var worker = new Worker(__filename.replace("test-", "workers/"));

worker.onmessage = function (msg) {
    if(msg.input) {
        assertEquals(msg.output, msg.input * 3);
    }
}

worker.addListener("message", function (msg) {
    if(msg == "terminate") {
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
}, 1000)