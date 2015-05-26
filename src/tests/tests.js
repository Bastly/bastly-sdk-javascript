module.exports = function(opts){
    var assert = require('chai').assert;
    var _ = require('lodash');
    var testChannel = "testChannel";
    var testApikey = "testApiKey";
    var testData = {name:"simpleObject"};
    var bastly;
    var library;
    library = opts.library;

    before(function(){
        if( opts.library === "ZEROMQ"){
            bastly = require('../node/bastlyZeromq.js');
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
    });

    after(function(){
        bastly.close();
    });

    //TODO check responses
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
        it('Message sended is equal to message received', function (done) {
            bastly.subscribe(receiveTestChannel, function messageCb (data, data2){
                //must change callback, at this stage many equal messages are send  
                //bastly.on(receiveTestChannel, function(){});
                assert.equal(true,_.isEqual(data, testData));
                console.log('calling done-------------------------------------------------');
                done();
            }, function finishedSubscription (){
                //subscription is completed, send a message
                console.log("sending messagesss");
                bastly.send(receiveTestChannel, testData);
            });
        });
    }); 
}

