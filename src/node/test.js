var fs = require('fs');
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

describe('SDK node', function() {

    it('Can send messages', function (done) {
        bastly.send(testChannel, testData, function(){
            done();
        });
        //TODO how to test this without atahualpa?
    });
}); 
