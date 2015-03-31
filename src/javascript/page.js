console.log('loaded');
var _ = require('lodash');
var socket = require('socket.io-client');
var request = require('request');
var bastly = {};
var channelId = "channelBroser";
bastly.worker = {};
bastly.socket = socket;

bastly.getWorker = function getWorker(id, callback){
    console.log('hola!');
    request('http://192.168.0.112:8080/api/requestChaski?channel=' + channelId + '&chaskiType=SOCKETIO', function (error, response, body) {
        console.log('holaGato!');
        console.log(response);
        console.log(body);
        var msg = JSON.parse(body);
        bastly.worker.ip = msg.message.ip;
        callback(bastly.worker.ip);

    });
};

bastly.send = function send(channel, msg, callback){
    request.post({
            url:'http://192.168.0.112:8080/api/publishMessage', 
            form: {channel: channelId, data:JSON.stringify(msg) }
        }, 
        function(err,httpResponse,body){ 
            if(callback){
                callback(err, httpResponse, body);
            } 
        }
    );
};

bastly.onPing = function onPing(callback){
};

bastly.on = function on(id, callback){
};

window.bastly = bastly;

bastly.getWorker('holaId', function(response){
    console.log('worker got');
    console.log(response);
    bastly.socket = socket('http://' + response+':3000');
    bastly.socket.on(channelId, function(msg){
        console.log('msg got from chaski-socketio!?!');
        console.log(msg);     
    });
}); 


var simpleMessageSend = function(){
    bastly.send(channelId, {msg:'este es el sended message'}, function(err, httpResponse, body){
        if(err){
            console.log('error, no message ACK got');
        }else{
            console.log('message send ACK got!');
        }
    });
};
setInterval(simpleMessageSend, 3000);

module.exports = function(opts){

    return bastly;
};
