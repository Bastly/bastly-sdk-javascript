module.exports = function(opts){
    var assert = require('chai').assert;
    var bastly;
    var testChannel = "testChannel";
    var testApikey = "testApiKey";
    var testData = {name:"simpleObject"};
    if( opts.library === "ZEROMQ"){
        var bastly = require('../node/bastlyZeromq.js');
        bastly = bastly({
            from: testChannel,
            apiKey: testApikey,
            callback: function (data){
                console.log("got a response");
            }
        });
    }
    if(opts.library === "SOCKETIO"){
        bastly = require('../browser/javascript/bastlyBrowser.js')({
            from: testChannel,
            apiKey: testApikey,
            callback: function (data){
                console.log("got a response");
            }
        });
    }

    describe('Sanity check', function() {
        it('tests work', function (done) {
            assert.equal('200', '200');
            done();
        });
    });

    describe('Can subscribe to a channel', function() {
        it('requests a worker', function (done) {
            bastly.subscribe("newChannel", undefined, function(response){
                done();
            });
        });
    });

    describe('Send messages', function() {
        it('Can send messages', function (done) {
            bastly.send(testChannel, testData, function(){
                done();
            });
        });
    }); 

    describe('Receives messages sended', function() {
        var receiveTestChannel = "receiveTestChannel";
        it('Receives messages for new Can send messages', function (done) {
            bastly.subscribe(receiveTestChannel, function(data, data2){
                console.log('data'); 
                console.log(data); 
                console.log('data2'); 
                console.log(data2); 
                console.log('testData'); 
                console.log(testData); 
                assert.equal(true,_.isEqual(data, testData));
                done();
            }, function(){
                //subscription is completed, send a message
                console.log("sending messagesss");
                bastly.send(receiveTestChannel, testData);
            });
        });
    }); 
}

