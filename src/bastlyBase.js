var bastly = {};
var bastlyImplementation;
bastly.workers = {};
bastly.callbacks = {};
bastly.callbacks['ping'] = function(data, worker){
    worker.isAlive = true;
};

//PART OF UTILS
function toArray(arrayLikeObject) {
        return [].slice.call(arrayLikeObject);
}

function sub_curry(fn /*, variable number of args */) {
    var args = [].slice.call(arguments, 1);
    return function () {
        return fn.apply(this, args.concat(toArray(arguments)));
    };
}

function curry(fn, length) {
    // capture fn's # of parameters
    length = length || fn.length;
    return function () {
        if (arguments.length < length) {
            // not all arguments have been specified. Curry once more.
            console.log('arguments');
            console.log(arguments);
            var combined = [fn].concat(toArray(arguments));
            return length - arguments.length > 0 
                ? curry(sub_curry.apply(this, combined), length - arguments.length)
                : sub_curry.call(this, combined );
        } else {
            // all arguments have been specified, actually call function
            return fn.apply(this, arguments);
        }
    };
}

//SHARED
var closeWorker = function(worker){
    console.log('closing Worker', worker.ip);
    bastlyImplementation.closeConnection(worker);
    bastly.workers[worker.ip] = {};
    clearInterval(worker.pingInterval);
};

//SHARED
var registerWorker = function registerWorker(workerIp, channel, callback){
    //if it's a existing worker, recover it and continue working with it
    bastly.workers[workerIp] = bastly.workers[workerIp] || {};
    bastly.workers[workerIp].channels = bastly.workers[workerIp].channels || [];
    bastly.workers[workerIp].channels.push({channel:channel});
    bastly.workers[workerIp].ip = workerIp;
    bastlyImplementation.createConnection(workerIp);
    bastly.workers[workerIp].pingInterval =  bastly.workers[workerIp].pingInterval || pingControl(bastly.workers[workerIp]);
    bastly.callbacks[channel] = callback;
    callback(bastly.workers[workerIp]);
}

//SHARED
var isAlive = function isAlive(worker){
    //if alive, set isAlive to false, pings make it alive again
    if(worker.isAlive === true){
        console.log('worker:', worker.ip, "IT'S ALIVE!");
        worker.isAlive = false;
    } else {
        console.log('worker:', worker.ip, "is dead... RIP");
        bastlyImplementation.closeWorker(worker);
        bastlyImplementation.replaceWorker(worker);
        //need to replace all the worker channels
    }
};

//SHARED 
var pingControl = function pingControl(worker){
    bastlyImplementation.listenToPing(worker);
    return setInterval(function() { isAlive(worker); }, 5000);
};


//SHARED
// for assigning new callbacks
bastly.on = function on(id, callback){
    bastly.callbacks[id] = callback;
};

var registerWorkerAndListenToChannel = function registerWorkerAndListenToChannel(channel, channelCallback, worker){
    console.log('worker got');
    console.log(worker, channel, channelCallback);
    //registers callbacks to be able to change them afterwards
    registerWorker(worker, channel, channelCallback);
    bastlyImplementation.workerListenToChannelAndAssociateCallback(bastly.workers[worker], channel);
};

//SHARED 
bastly.subscribe = function subscribe(channel, channelCallback){
    console.log('subscribing');
    console.log(channel, channelCallback);
    bastlyImplementation.getWorker(channel, bastly.from, curry(registerWorkerAndListenToChannel)(channel, channelCallback)); 
};

//SHARED
var replaceWorker = function replaceWorker(worker){
    for(var channelIndex in worker.channels) {
        var channel =  worker.channels[channelIndex];
        bastly.subscribe(channel, bastly.callbacks[channel]);
    } 
};


//SHARED
module.exports = function(bastlyImplemtentationAux){

    bastlyImplementation =  bastlyImplemtentationAux;
    console.log('implementation');
    console.log(bastlyImplementation);

    return function(opts){
        console.log('loading sdk');
        console.log(opts);

        //TODO missing checks
        bastly.from = opts.from;
        bastly.apiKey = opts.apiKey;
        bastly.callbacks[bastly.from] = opts.callback;
        if(typeof opts.ipToConnect !== "undefined"){
            bastlyImplemtentationAux.IP_TO_CONNECT = opts.ipToConnect;
        }
        bastly.subscribe(bastly.from, opts.callback);

        bastly.send = bastlyImplementation.send;

        return bastly;
    };
};
