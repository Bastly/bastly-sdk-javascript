console.log('loaded');
var _ = require('lodash');
var bastly = {};
var bastlyConn = require('./bastlySocketio')();
var bastlyConn = require('./bastlyZeromq')();

bastly.workers = {};
bastly.callbacks = {};

//SHARED
var closeWorker = function(worker){
    console.log('closing Worker', worker.ip);
    bastlySocketio.closeConnection(worker);
    bastly.workers[worker.ip] = {};
    clearInterval(worker.pingInterval);
};

//SHARED
var registerWorker = function(workerIp, channel, callback){
    //if it's a existing worker, recover it and continue working with it
    bastly.workers[workerIp] = bastly.workers[workerIp] || {};
    bastly.workers[workerIp].channels = bastly.workers[workerIp].channels || [];
    bastly.workers[workerIp].channels.push({channel:channel});
    bastly.workers[workerIp].ip = workerIp;
    bastlySocketio.createConnection(workerIp);
    bastly.workers[workerIp].pingInterval =  bastly.workers[workerIp].pingInterval || pingControl(bastly.workers[workerIp]);
    bastly.callbacks[channel] = callback;
    callback(bastly.workers[workerIp]);
}


//SHARED
var replaceWorker = function(worker){
    _.each(worker.channels, function(channel){
        getWorker(channel, function(newWorker){
            console.log('worker got');
            //recovering previous channel callbacks
            bastlySocketio.workerListenToChannelAndAssociateCallback(newWorker, channel);
        }); 
    });
};


//SHARED
var isAlive = function(worker){
    //if alive, set isAlive to false, pings make it alive again
    if(worker.isAlive === true){
        console.log('worker:', worker.ip, "IT'S ALIVE!");
        worker.isAlive = false;
    } else {
        console.log('worker:', worker.ip, "is dead... RIP");
        bastlySocketio.closeWorker(worker);
        bastlySocketio.replaceWorker(worker);
        //need to replace all the worker channels
    }
};

//SHARED 
var pingControl = function(worker){
    bastlySocketio.listenToPing(worker);
    return setInterval(function() { isAlive(worker); }, 5000);
};


//SHARED
// for assigning new callbacks
bastly.on = function on(id, callback){
    bastly.callbacks[id] = callback;
};


//SHARED 
bastly.subscribe = function(channel, channelCallback){
    bastlySocketio.getWorker(channel, function(worker){
        console.log('worker got');
        //registers callbacks to be able to change them afterwards
        registerWorker(worker, channel, channelCallback);
        bastlySocketio.workerListenToChannelAndAssociateCallback(worker, channel);
     }); 
};

//SHARED
bastly.send = bastlySocketio.send;

//SHARED
window.bastly = module.exports = function(from, apiKey, callback, ipConectorRest){

    //TODO missing checks
    bastly.from = from;
    bastly.apiKey = apiKey;
    bastly.callbacks[bastly.from] = callback;
    if(typeof ipConectorRest !== "undefined"){
        IP_CONNECTOR_REST = ipConectorRest;
    }

    bastly.subscribe(bastly.from, callback);

    return bastly;
};
