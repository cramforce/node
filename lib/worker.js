var sys = require('sys');

var workerIndex = 0;
var MESSAGE_SPLITTER = "\r\n";
var WORKER_PARAS = ["-mode", "worker"];
var workerImplementation = WorkerChild;
var workerProcessImplementation = WorkerProcess;

exports.importScripts = function () {
    for  (var i = 0, len = arguments.length; i < len; ++i) {
        require(arguments[i]);
    }
};

var Worker = function (filename) {
    var self = this;
    process.EventEmitter.call(this);
    
    this.addListener("message", function (message) {
        if  (self.onmessage) {
            self.onmessage(message);
        }
    });
    
    this.impl = new workerImplementation(this, filename);
};

sys.inherits(Worker, process.EventEmitter);
Worker.prototype.postMessage =  function (payload) {
    var message = JSON.stringify(payload);
    this.impl.postMessage(message);
};
    
Worker.prototype.terminate = function () {
    this.impl.terminate();
};


exports.Worker = Worker;

function WorkerChild (eventDest, filename) {
    var self = this;
    this.eventDest  = eventDest;
    this.filename = filename;
    this.child = process.createChildProcess("node", [this.filename].concat(WORKER_PARAS));
    
    this.child.addListener("output", function (data) {
        self.handleData(data);
    });
    
    this.child.addListener("error", function (data) {
        sys.error(data || "");
    });
    
    this.child.addListener("exit", function (code) {
        //sys.error("Child exit with "+code)
    });
    
    this.buffer = "";
}

WorkerChild.prototype = {
    
    postMessage: function (message) {
        this.child.write(message+MESSAGE_SPLITTER, "utf8");
    },
    
    handleData: function (data) {
        this.buffer += data;
        //sys.error("Received data "+this.buffer)
        
        var parts = this.buffer.split(MESSAGE_SPLITTER);
        if  (parts.length > 1) {
            var message = parts.shift();
            this.handleMessage(message);
            
            this.buffer = parts.join(MESSAGE_SPLITTER);
            this.handleData("");
        }
    },
    
    handleMessage: function (message) {
        //sys.error("Emit event "+message)
        this.eventDest.emit("message", JSON.parse(message))
    },
    
    terminate: function () {
        this.child.kill();
    }
};

var workerProcess;

function WorkerProcess(eventDest) {
    var self = this;
    this.eventDest = eventDest;
    process.stdio.open();
    process.stdio.addListener("data", function (data) {
        //sys.error("Child receved data");
        self.handleData(data);
    });
    this.buffer = "";
}

WorkerProcess.prototype = {
    postMessage: function (message) {
        sys.print(message+MESSAGE_SPLITTER);
    },
    
    handleData:    WorkerChild.prototype.handleData,
    handleMessage: WorkerChild.prototype.handleMessage
};

function WorkerNode () {
    var self = this;
    this.impl = new workerProcessImplementation(this);
    
    process.EventEmitter.call(this);
    this.addListener("message", function (message) {
        //sys.error("Received message "+message)
        if  (self.onmessage) {
            self.onmessage(message);
        }
    });
}
sys.inherits(WorkerNode, process.EventEmitter);

WorkerNode.prototype.postMessage = function (payload) {
    this.impl.postMessage(JSON.stringify(payload));
};

(function () {
    if  (len = process.ARGV.length < 4) return;
    for  (var i = 2, len = process.ARGV.length; i < len; ++i) {
        var arg = process.ARGV[i];
        if  (arg != WORKER_PARAS[i-2]) {
            //sys.error("Fail");
            return;
        }
    }
    
    exports.worker = new WorkerNode();

    setInterval(function () {}, 10000);
})();
