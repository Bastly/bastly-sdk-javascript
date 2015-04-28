console.log('loaded');
var _ = require('lodash');
var request = require('request');
var constants = require('bastly_constants');
var bastly = {};
var io = require('socket.io-client');
var IP_ATAHUALPA = 'atahualpa.bastly.com';
bastly.workers = {};
bastly.callbacks = {};

var closeWorker = function(worker){
    console.log('closing Worker', worker.ip);
    worker.socket.disconnect();
    bastly.workers[worker.ip] = {};
    clearInterval(worker.pingInterval);
};


//Interfase
var createConnection = function(workerIp){
    // forceNew is required because a connect/disconnect/connect cycle does not work without it
    bastly.workers[workerIp].socket = bastly.workers[workerIp].socket || io.connect('http://' + workerIp + ':3000', {'forceNew': true });
}

//SHARED
var registerWorker = function(workerIp, channel, callback){
    //if it's a existing worker, recover it and continue working with it
    bastly.workers[workerIp] = bastly.workers[workerIp] || {};
    bastly.workers[workerIp].channels = bastly.workers[workerIp].channels || [];
    bastly.workers[workerIp].channels.push({channel:channel});
    bastly.workers[workerIp].ip = workerIp;
    createConnection(workerIp);
    bastly.workers[workerIp].pingInterval =  bastly.workers[workerIp].pingInterval || pingControl(bastly.workers[workerIp]);
    callback(bastly.workers[workerIp]);
}



//interface
var getWorker = function getWorker(channel, callback){
    console.log('getting worker!');
    request('http://' + IP_ATAHUALPA + ':8080/api/requestChaski?channel=' + channel + '&chaskiType=' + constants.CHASKI_TYPE_SOCKETIO, function (error, response, body) {
        console.log('Worker got!', body);
        var msg = JSON.parse(body);
        var workerIp = msg.message.ip;
        registerWorker(workerIp, channel, callback);
    });
};

bastly.send = function send(to, msg, callback){
    console.log('send', Date.now());
    request.post({
            url:'http://' + IP_ATAHUALPA + ':8080/api/publishMessage', 
            form: {to: to, from: bastly.from, apiKey: bastly.apiKey, data:JSON.stringify(msg) }
        }, 
        function(err,httpResponse,body){ 
            //ACK callback 
            if(callback){
                callback(err, httpResponse, body);
            } 
        }
    );
};

var isAlive = function(worker){
    //if alive, set isAlive to false, pings make it alive again
    if(worker.isAlive === true){
        console.log('worker:', worker.ip, "IT'S ALIVE!");
        worker.isAlive = false;
    } else {
        console.log('worker:', worker.ip, "is dead... RIP");
        closeWorker(worker);
        //need to replace the worker
        _.each(worker.channels, function(channel){
            getWorker(channel, function(newWorker){
                console.log('worker got');
                //recovering previous channel callbacks
                newWorker.socket.on(channel, function(data){
                    bastly.callbacks[channel](data);
                });
            }); 
        });
    }
};

var pingControl = function(worker){
    worker.socket.on('ping', function(){
        console.log('gotPing, worker', worker.ip, 'LIVE LONG AND PROSPER');
        worker.isAlive = true;
    }); 
    return setInterval(function() { isAlive(worker); }, 5000);
};

// for assigning new callbacks
bastly.on = function on(id, callback){
    bastly.callbacks[id] = callback;
};

bastly.subscribe = function(channel, channelCallback){
    getWorker(channel, function(worker){
        console.log('worker got');
        //registers callbacks to be able to change them afterwards
        bastly.callbacks[channel] = channelCallback;
        worker.socket.on(channel, function(data){
            bastly.callbacks[channel](data);
        });
    }); 
};

window.bastly = module.exports = function(from, apiKey, callback, ipAtahualpa){

    //TODO missing checks
    bastly.from = from;
    bastly.apiKey = apiKey;
    bastly.callbacks[bastly.from] = callback;
    if(typeof ipAtahualpa !== "undefined"){
        IP_ATAHUALPA = ipAtahualpa;
    }

    bastly.subscribe(bastly.from, callback);

    return bastly;
};
