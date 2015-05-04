console.log('loaded');
var _ = require('lodash');
var bastly = {};
var bastlyImplementation;
bastly.workers = {};
bastly.callbacks = {};
bastly.callbacks['ping'] = function(data, worker){
    worker.isAlive = true;
};

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
var replaceWorker = function replaceWorker(worker){
    _.each(worker.channels, function(channel){
        getWorker(channel, function(newWorker){
            console.log('worker got');
            //recovering previous channel callbacks
            bastlyImplementation.workerListenToChannelAndAssociateCallback(newWorker, channel);
        }); 
    });
};


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


//SHARED 
bastly.subscribe = function subscribe(channel, channelCallback){
    console.log('subscribing');
    console.log(channel, channelCallback);
    bastlyImplementation.getWorker(channel, function(worker){
        console.log('worker got');
        console.log(worker, channel, channelCallback);
        //registers callbacks to be able to change them afterwards
        registerWorker(worker, channel, channelCallback);
        bastlyImplementation.workerListenToChannelAndAssociateCallback(bastly.workers[worker], channel);
     }); 
};

//SHARED

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
