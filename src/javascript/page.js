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
    request('http://192.168.0.112:8080/api/requestChaski?channel=' + channelId, function (error, response, body) {
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
            form: {channel: channelId, message:msg }
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
    bastly.socket = io('http://' + response);
    bastly.socket.on('message', function(msg){
        console.log('msg got from chaski-socketio!?!');
        conssole.log(msg);     
    });
}); 

bastly.send(channelId, 'este es el sended message', function(err, httpResponse, body){
    console.log('message send ACK got!');
});
bastly.send(channelId, 'este es el sended message', function(err, httpResponse, body){
    console.log('message send ACK got!');
});
bastly.send(channelId, 'este es el sended message', function(err, httpResponse, body){
    console.log('message send ACK got!');
});

module.exports = function(opts){

    return bastly;
};
