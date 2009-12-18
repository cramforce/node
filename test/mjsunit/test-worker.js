process.mixin(require("./common"));

var sys = require("sys");
var Worker = require("worker").Worker;

process.ENV["NODE_PATH"] = process.libDir;

function makeWorker () {
  return new Worker(__filename.replace("test-", "fixtures/"));
}

var worker = makeWorker();

worker.onmessage = function (msg) {
  if (msg.input) {
    assert.equal(msg.output, msg.input * 3);
    sys.error("Good");
  }
};

worker.postMessage({
  input: 1
});
worker.postMessage({
  input: 2
});
worker.postMessage({
  input: 3
});
worker.postMessage({
  input: 4
});

setTimeout(function () {
  worker.terminate();
}, 20);

setTimeout(function () {
  setTimeout(function () {
    var w2 = makeWorker();
    w2.postMessage({
      error: true
    });
    w2.addListener("error", function () {
      sys.error("test");
      assert.ok(true, "Received expected error");
      w2.terminate();
    });
    w2.addListener("message", function () {
      assert.ok(false, "Wanted an error, but got a message");
      w2.terminate();
    });
    worker.postMessage({
      input: 8
    });
  }, 10);
  worker.terminate()
}, 10);

var fibWorker = makeWorker();
fibWorker.postMessage({
  fib: 41
});
var ret = false;
fibWorker.addListener("message", function (fib) {
  sys.error("Fib "+fib);
  ret = true;
  assert.ok(fib === 165580141, "Worker can do long running stuff.")
  fibWorker.terminate();
});
for(var i = 0; i < 100; ++i) {
  // counting;
}
assert.ok(!ret, "Can do work while background spins");

var waitWorker = makeWorker();
waitWorker.postMessage({
  wait: true
});
waitWorker.addListener("message", function () {
  assert.ok(true, "Worker response can be async.")
  waitWorker.terminate();
});
