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
            //console.log('arguments');
            //console.log(arguments);
            var combined = [fn].concat(toArray(arguments));
            return length - arguments.length > 0 ? curry(sub_curry.apply(this, combined), length - arguments.length) : sub_curry.call(this, combined );
        } else {
            // all arguments have been specified, actually call function
            return fn.apply(this, arguments);
        }
    };
}


//SHARED
bastly.callCallback = function callCallback(channel, dataRaw, worker){
    console.log('data received');
    /*
    console.log(dataRaw);
    console.log(typeof dataRaw);
    console.log(dataRaw.data);
    */
    var data = JSON.parse(dataRaw.data);
    var from = dataRaw.from;
    
    bastly.callbacks[channel](data, worker);
};

//SHARED
bastly.pingGot = function pingGot(worker){
   bastly.callbacks['ping'](undefined, worker);
};


//SHARED
bastly.close = function close(){
    bastlyImplementation.close();
    for(var w in bastly.workers){
        closeWorker(bastly.workers[w]);
    }
};

//SHARED
var closeWorker = function closeWorker(worker){
    console.log('closing Worker', worker.ip);
    bastlyImplementation.closeConnection(worker);
    bastly.workers[worker.ip] = {};
    clearInterval(worker.pingInterval);
};

//SHARED
var registerWorker = function registerWorker(workerIp, channel, channelCallback, callback){
    //if it's a existing worker, recover it and continue working with it
    bastly.workers[workerIp] = bastly.workers[workerIp] || {};
    bastly.workers[workerIp].channels = bastly.workers[workerIp].channels || [];
    bastly.workers[workerIp].channels.push({channel:channel});
    bastly.workers[workerIp].ip = workerIp;
    bastlyImplementation.createConnection(workerIp);
    bastly.workers[workerIp].pingInterval =  bastly.workers[workerIp].pingInterval || pingControl(bastly.workers[workerIp]);
    bastly.callbacks[channel] = channelCallback;
    if(callback){
        callback();
    }
};

//SHARED
var isAlive = function isAlive(worker){
    //if alive, set isAlive to false, pings make it alive again
    if(worker.isAlive === true){
        //console.log('worker:', worker.ip, "IT'S ALIVE!");
        worker.isAlive = false;
    } else {
        console.log('worker:', worker.ip, "is dead... RIP");
        closeWorker(worker);
        replaceWorker(worker);
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
bastly.on = function on(channel, callback){
    var previousCallback = bastly.callbacks[channel];
    bastly.callbacks[channel] = callback;
    if(!previousCallback){
        bastly.subscribe(channel, bastly.callbacks[channel]);
    } 
};

var registerWorkerAndListenToChannel = function registerWorkerAndListenToChannel( channel, channelCallback, callback, error, data ){
    if (!error) {
        console.log('worker got ', data);
        console.log(data.workerIp, channel, channelCallback);
        //registers callbacks to be able to change them afterwards
        registerWorker(data.workerIp, channel, channelCallback, function(){
            bastlyImplementation.workerListenToChannelAndAssociateCallback(bastly.workers[data.workerIp], channel);
            if(callback){
                callback(error, data);
            }
        });
    } else {
        if (callback )callback(error, data);
        console.log('coudnt get a worker for an error');
    }
};

//SHARED 
bastly.subscribe = function subscribe(channel, channelCallback, callback){
    var channelToSubscribe = bastly.apiKey + ":" + channel;
    console.log('subscribing to ' + channelToSubscribe);
    //console.log(channel, channelCallback);
    bastlyImplementation.getWorker(channel, bastly.from, bastly.apiKey, curry(registerWorkerAndListenToChannel)(channelToSubscribe, channelCallback, callback)); 
};

bastly.getWorker = function getWorker(channel, from, apiKey, callback){
    bastlyImplementation.getWorker(channel, from, apiKey, callback);
};

//SHARED
var replaceWorker = function replaceWorker(worker){
    console.log('replace worker');
    for(var channelIndex in worker.channels) {
        var channel =  worker.channels[channelIndex];
        bastly.subscribe(channel, bastly.callbacks[channel]);
    } 
};

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var toRet = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        toRet += charSet.substring(randomPoz, randomPoz+1);
    }
    return toRet;
}

//SHARED
module.exports = function(bastlyImplemtentationAux){

    bastlyImplementation =  bastlyImplemtentationAux;
    console.log('implementation');
    //console.log(bastlyImplementation);

    return function (opts) {
        console.log('loading sdk');

        bastly.from = opts.from + randomString(8);
        bastly.apiKey = opts.apiKey;
        bastly.callbacks[bastly.from] = opts.callback;

        bastly.send = bastlyImplementation.send;
        

        if (! opts.middleware || opts.middleware !== true) {
            console.log('starting as a normal client. With subscription');
            bastly.subscribe(bastly.from, opts.callback, opts.opsCallback);

            setInterval( function ping () {
                bastlyImplementation.ping();
            }, 2 * 60 * 1000);
        } else {
            bastly.sendMessage = bastlyImplementation.sendMessage;
            console.log('starting as a middleware. Without subscription');
        }
        
        return bastly;
    };
};
