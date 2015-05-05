var fs = require('fs');
var assert = require('assert');

describe('SDK node', function() {

    it('can be imported', function (done) {
        var bastly = require('./bastlyZeromq.js')({
            from: "testZeromq",
            apiKey: "testZeromqkey",
            callback: function (data){
                console.log("got a response");
            }
        });
        assert.equal(1,1);
        done();
    });
});

describe('SDK node', function() {

    it('Can send messages', function (done) {
        //TODO how to test this without atahualpa?
        done();
    });
}); 
