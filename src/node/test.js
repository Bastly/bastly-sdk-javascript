var fs = require('fs');
var _ = require('lodash');
var assert = require('assert');
var testChannel = "testZeromq";
var testApikey = "testZeromqApiKey";
var bastly = require('./bastlyZeromq.js')({
    from: testChannel,
    apiKey: testApikey,
    callback: function (data){
        console.log("got a response");
    }
});
var testData = {name:"simpleObject"};

describe('SDK node', function() {
    it('can be imported', function (done) {
        assert.equal(1,1);
        done();
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
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            console.log("sending messagesss");
            bastly.send(receiveTestChannel, testData);
        });
    });
}); 

describe('helper function to wait', function() {
    it('Can send messages', function (done) {
        setTimeout(done, 1000);
    });
}); 
