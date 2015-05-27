var logHandler = require('./logHandler.js');
var log = logHandler({name:'sdk-node', log:log});    
var zmq = require('zmq');
var constants = require('bastly_constants');
var requestChaskiSocket = zmq.socket('req'); 
var sendMessageSocket = zmq.socket('req');
var pingImAliveSocket = zmq.socket('req'); 
var bastly;
var IP_DEFAULT_ATAHUALPA = 'atahualpa.bastly.com';
var IP_DEFAULT_CURACA = 'curaca.bastly.com';
var isMiddleware = false;

module.exports = function(opts){
    var module = {};
    var callbacks = [];
    var acks = [];
    //INTERFACE
    module.IP_TO_CONNECT =  opts.connector || IP_DEFAULT_ATAHUALPA;
    module.IP_TO_CURACA = opts.curaca || IP_DEFAULT_CURACA;

    // Request chaskis socket
    requestChaskiSocket.connect('tcp://' + module.IP_TO_CONNECT + ':' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_REQUEST_WORKER);
    requestChaskiSocket.on('message', function(result, data){
        var parsedResponse = JSON.parse(data);
        log.info('got message', parsedResponse);
        var workerIp = parsedResponse.ip;
        //TODO we must implement some way to understand which response is to each request , since the order does not have to be LILO
        callbacks.shift()({ result.toString(), parsedResponse });
    });

    // Send messages sockets
    sendMessageSocket.connect('tcp://' + module.IP_TO_CONNECT + ':' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_MESSAGES);
    sendMessageSocket.on('message', function(res, message){
        //TODO we must implement some way to understand which response is to each request , since the order does not have to be LILO
        var ack = acks.shift();
        if(ack){
            ack(res.toString())
        }; 
    });

    if (! opts.middleware || opts.middleware != true) {
        // ping im alive sockets
        pingImAliveSocket.connect('tcp://' + module.IP_TO_CURACA + ':' + constants.PORT_REQ_REP_ATAHUALPA_CURACA_COMM);
        pingImAliveSocket.on('message', function(res, message){});
    } else {
         isMiddleware = true;
    }

    //INTERFACE
    module.closeConnection = function closeConnection(worker){
        sendMessageSocket.close();
        requestChaskiSocket.close();
        pingImAliveSocket.close();
    };

    //INTERFACE
    module.createConnection = function createConnection(workerIp){
        console.log('creating connection for', workerIp);
        console.log(bastly);
        var newSub = zmq.socket('sub'); 
        var reveiverUrl = 'tcp://' + workerIp + ':' + constants.PORT_PUB_SUB_CHASKI_CLIENT_MESSAGES;
        log.info('connecting', reveiverUrl);
        bastly.workers[workerIp].socket = bastly.workers[workerIp].socket || newSub.connect(reveiverUrl);
        bastly.workers[workerIp].socket.on('message', function(topic, from,  data){
            log.info('message got', topic.toString(), data.toString(), data.toString());
            data = JSON.parse(data);
            bastly.callbacks[topic](data, undefined);
        });
    }

    module.ping = function ping () {
        if (! opts.middleware || opts.middleware != true) {
            var dataToSendForRequestingWoker = [
                'PING', //ACTION
                'noone', //TO
                bastly.from, //FROM
                bastly.apiKey //apiKey
            ];
            pingImAliveSocket.send(dataToSendForRequestingWoker);
        }
    };

    //INTERFACE
    module.getWorker = function getWorker(channel, from, apiKey, callback){
        console.log('getting worker!');
        log.info('get worker', channel);
        var dataToSendForRequestingWoker = [
            'subscribe', //ACTION
            channel, //TO
            from, //FROM
            apiKey, //apiKey
            isMiddleware ? constants.CHASKI_TYPE_SOCKETIO : constants.CHASKI_TYPE_ZEROMQ//type
        ];

        callbacks.push(callback); 
        requestChaskiSocket.send(dataToSendForRequestingWoker);
    };

    //INTERFACE
    module.send = function send(to, msg, callback){
        console.log('send', Date.now());
        var data;
        if(typeof msg === 'object'){
            data = JSON.stringify(msg);
        } else {
            throw new Error('message must be a javascrip object');
        }
        log.info('data is', data);
        var dataToSend = [
            'send', //ACTION
            to, 
            bastly.from, 
            bastly.apiKey, //apiKey
            data,//data

        ];
        acks.push(callback);
        sendMessageSocket.send(dataToSend);
    };

    //INTERFACE
    module.workerListenToChannelAndAssociateCallback = function (worker, channel){
        console.log('workerListenToChannelAndAssociateCallback');
        //console.log(worker);
        worker.socket.subscribe(channel) 
    };

    //INTERFACE
    module.listenToPing = function(worker){
        worker.socket.subscribe('ping');
    };

    //COMMON
    console.log('creating bastly');
    var bastlyBase = require('../bastlyBase')(module);
    bastly =  bastlyBase(opts);

    return bastly;
};
