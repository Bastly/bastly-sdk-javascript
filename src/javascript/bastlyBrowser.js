var request = require('request');
var io = require('socket.io-client');
var IP_CONNECTOR_REST = 'connectorrest.bastly.com';
var constants = require('bastly_constants');
var bastly;

window.bastly = module.exports = function(opts){
    var module = {};
    //INTERFACE
    module.closeConnection = function closeConnection(worker){
        worker.socket.disconnect();
    };

    //INTERFACE
    module.createConnection = function createConnection(workerIp){
        console.log('creating connection for', workerIp);
        console.log(bastly);
        
        // forceNew is required because a connect/disconnect/connect cycle does not work without it
        bastly.workers[workerIp].socket = bastly.workers[workerIp].socket || io.connect('http://' + workerIp + ':3000', {'forceNew': true });
    }

    //INTERFACE
    module.getWorker = function getWorker(channel, callback){
        console.log('getting worker!');
        request('http://' + IP_CONNECTOR_REST + ':8080/api/requestChaski?channel=' + channel + '&chaskiType=' + constants.CHASKI_TYPE_SOCKETIO, function (error, response, body) {
            console.log('Worker got!', body);
            var msg = JSON.parse(body);
            var workerIp = msg.message.ip;
            callback(workerIp);
        });
    };

    //INTERFACE
    module.send = function send(to, msg, callback){
        console.log('send', Date.now());
        request.post({
                url:'http://' + IP_CONNECTOR_REST + ':8080/api/publishMessage', 
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

    //INTERFACE
    module.workerListenToChannelAndAssociateCallback = function (worker, channel){
        console.log('workerListenToChannelAndAssociateCallback');
        console.log(worker);
        worker.socket.on(channel, function(data){
            bastly.callbacks[channel](data);
        });
    };

    //INTERFACE
    module.listenToPing = function(worker){
        worker.socket.on('ping', function(){
            console.log('gotPing, worker', worker.ip, 'LIVE LONG AND PROSPER');
            worker.isAlive = true;
        }); 
    };

    var bastlyBase = require('./bastlyBase')(module);

    bastly =  bastlyBase(opts);
    console.log('returning bastly sdk');
    console.log(bastly);
    
    return bastly;
};
