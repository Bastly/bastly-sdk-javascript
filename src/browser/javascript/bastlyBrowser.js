var io = require('socket.io-client');
var IP_CONNECTOR_REST = 'connectorrest.bastly.com';
var constants = require('bastly_constants');
var bastly;

var HttpClient = function() {
    console.log('helllooo');
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.onreadystatechange = function() { 
            console.log(anHttpRequest);
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) {
                aCallback(false, anHttpRequest.response);
            } 
        }
        anHttpRequest.send( null );
    }
    this.post = function(aUrl, data, aCallback) {
        var anHttpRequest = new XMLHttpRequest();

        anHttpRequest.open( "POST", aUrl, true);            
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) {
                console.log(anHttpRequest);
                aCallback(false, anHttpRequest.response);
            } 
        }
        anHttpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        anHttpRequest.send(JSON.stringify(data));
    }
}
aClient = new HttpClient();

window.bastly = module.exports = function(opts){
    var module = {};

    //INTERFACE
    module.IP_TO_CONNECT = IP_CONNECTOR_REST;

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
    module.getWorker = function getWorker(channel, from, callback){
        console.log('getting worker!');
        var url =  'http://' + module.IP_TO_CONNECT + ':8080/api/requestChaski?channel=' + channel + '&chaskiType=' + constants.CHASKI_TYPE_SOCKETIO;
        console.log(url);
        aClient.get(url, function (error, response) {
            if (!error) {
                console.log('Worker got!', response);
                var msg = JSON.parse(response);
                var workerIp = msg.message.ip;
                console.log('worker got', workerIp);
                callback(workerIp);
            } else {
                console.log('error getting worker');
                console.log(response);
            }
        });
    };

    //INTERFACE
    module.send = function send(to, msg, callback){
        console.log('send', Date.now());
        var url = 'http://' + module.IP_TO_CONNECT + ':8080/api/publishMessage';
        var data = {to: to, from: bastly.from, apiKey: bastly.apiKey, data:JSON.stringify(msg) };
        aClient.post(url, data, function (error, response) {
                //ACK callback 
                if(callback){
                    callback(error, response);
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
            bastly.callbacks['ping']('ping', worker);
        }); 
    };

    var bastlyBase = require('../../bastlyBase')(module);

    bastly =  bastlyBase(opts);
    console.log('returning bastly sdk');
    console.log(bastly);
    
    return bastly;
};
