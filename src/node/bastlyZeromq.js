var logHandler = require('./logHandler.js');
var log = logHandler({name:'sdk-node', log:log});    
var zmq = require('zmq');
var constants = require('bastly_constants');
var requestChaskiSocket = zmq.socket('req'); 
var sendMessageSocket = zmq.socket('req'); 
var bastly;
var IP_DEFAULT_ATAHUALPA = 'atahualpa.bastly.com';

module.exports = function(opts){
    var module = {};
    var callbacks = [];
    var acks = [];
    //INTERFACE
    module.IP_TO_CONNECT = IP_DEFAULT_ATAHUALPA;

    requestChaskiSocket.connect('tcp://' + module.IP_TO_CONNECT + ':' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_REQUEST_WORKER);
    requestChaskiSocket.on('message', function(result, data){
        var parsedResponse = JSON.parse(data);
        log.info('got message', parsedResponse);
        module.chaski.ip = parsedResponse.ip;
        //TODO we must implement some way to understand which response is to each request , since the order does not have to be LILO
        callbacks.shift()(parsedResponse);
    });


    sendMessageSocket.connect('tcp://' + module.IP_TO_CONNECT + ':' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_MESSAGES);
    sendMessageSocket.on('message', function(res, message){
        //TODO we must implement some way to understand which response is to each request , since the order does not have to be LILO
        acks.shift()(res.toString()); 
    });


    //INTERFACE
    module.closeConnection = function closeConnection(worker){
        sendMessageSocket.close();
        requestChaskiSocket.close();
    };

    //INTERFACE
    module.createConnection = function createConnection(workerIp){
        console.log('creating connection for', workerIp);
        console.log(bastly);
        var newSub = zmq.socket('sub'); 
        var reveiverUrl = 'tcp://' + workerIp + ':' + constants.PORT_PUB_SUB_CHASKI_CLIENT_MESSAGES;
        log.info('connecting', reveiverUrl);
        bastly.workers[workerIp].socket = bastly.workers[workerIp].socket || newSub.connect(reveiverUrl);
        bastly.workers[workerIp].socket.on('message', function(topic, data, worker){
            bastly.callbacks[topic](data);
        });
    }

    //INTERFACE
    module.getWorker = function getWorker(channel, from, channelCallback, callback){
        console.log('getting worker!');
        log.info('get worker', channel);
        var dataToSendForRequestingWoker = [
            'subscribe', //ACTION
            channel, //TO
            from, //FROM
            'fakeApiKey', //apiKey
            constants.CHASKI_TYPE_ZEROMQ//type
        ];

        callbacks.push(callback); 
        requestChaskiSocket.send(dataToSendForRequestingWoker);
    };

    //INTERFACE
    module.send = function send(to, msg, callback){
        console.log('send', Date.now());
        var data;
        if(typeof message === 'object'){
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
        console.log(worker);
        worker.socket.subscribe(channel) 
    };

    //INTERFACE
    module.listenToPing = function(worker){
        worker.socket.subscribe('ping');
    };

    //COMMON
    var bastlyBase = require('../bastlyBase')(module);
    bastly =  bastlyBase(opts);
    
    IP_TO_CONNECT = bastly.IP_TO_CONNECT || IP_DEFAULT_ATAHUALPA;
    return bastly;
};
