var assert = require('chai').assert;
var bastly = require('../bastly.js')();

describe('Sanity check', function() {
    it('tests work', function (done) {
        assert.equal('200', '200');
        done();
    });
});

describe('Can request worker', function() {
    it('requests a worker', function (done) {
        var id = "fakeIdd";
        bastly.getWorker(id, function(response){
            done();
        });
    });
});

describe('Can send messages ', function() {
    it('sends a message', function (done) {
        var id = "fakeIdd";
        bastly.getSend(id, msg, function(response){
            //is there a response?
            assert.not.null(response);  
            done();
        });
    });
});

describe('Receives pings from worker ', function() {
    it('requests a worker', function (done) {
        var id = "fakeIdd";
        bastly.onPing(function(response){
            //is there a response?
            assert.not.null(response);  
            done();
        });
    });
});

describe('Receives messages', function() {
    it('sends a message and receives it', function (done) {
        var id = "fakeIdd";
        bastly.on('message',  function(response){
            //is there a response?
            assert.not.null(response);  
            done();
        });
    });
});
