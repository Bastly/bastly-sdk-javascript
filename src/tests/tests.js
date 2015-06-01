

module.exports = function(opts){
    var assert = require('chai').assert;
    var _ = require('lodash');
    var request = require('request');
    var testChannel = "testChannel";
    var testApikey = "testApiKey";
    var testData = {name:"simpleObject"};
    var bastly;
    var library;
    library = opts.library;

    describe('Sanity check', function() {
      this.timeout(15000);
        it('tests work', function (done) {
            request.get('http://www.google.com', function(err, body){
                console.log('get request finished', err, body);
                assert.equal('200', '200');
                done();
            }); 
        });
    });

};

