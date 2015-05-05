// PhantomJS doesn't support bind yet
Function.prototype.bind = Function.prototype.bind || function (thisp) {
    var fn = this;
    return function () {
        return fn.apply(thisp, arguments);
    };
};
var assert = require('chai').assert;
var bastly = require('../bastlyBrowser.js')({
    from: "test",
    apiKey: "testApikey",
    callback: function(){
        console.log('testfunction');
    }
});

describe('Sanity check', function() {
    it('tests work', function (done) {
        assert.equal('200', '200');
        done();
    });
});

describe('Can subscribe to a channel', function() {
    it('requests a worker', function (done) {
        bastly.subscribe("newChannel", function(response){
            done();
        });
    });
});

describe('Can send messages ', function() {
    it('sends a message', function (done) {
        done();
    });
});

describe('Receives pings from worker ', function() {
    it('requests a worker', function (done) {
        done();
    });
});

describe('Receives messages', function() {
    it('sends a message and receives it', function (done) {
        done();
    });
});
