module.exports = function(opts){
    var assert = require('chai').assert;
    var _ = require('lodash');
    var testChannel = "testChannel";
    var testApikey = "testApiKey";
    var correctApiKey = "internalTestApiKey";
    var testData = {name:"simpleObject"};
    var bastly;
    var library;
    var request = require('request');
    var IP_CURACA = '192.168.1.236';
    library = opts.library;

    describe('Creation', function(){
        it('should give an invalid API KEY error', function (done) {
            this.timeout(5000);
            if( opts.library === "ZEROMQ"){
                bastly = require('../node/bastlyZeromq.js');
                bastly = bastly({
                    connector:'192.168.1.234',
                    curaca: '192.168.1.236',
                    from: testChannel,
                    apiKey: testApikey,
                    callback: function (data){
                        console.log("got a response" + data);
                    },
                    opsCallback: function (error, data){
                        console.log("got a response " + data);
                         assert.equal(true, error);
                        done();
                    }
                });
            }
            if(opts.library === "SOCKETIO"){
                console.log('socketIO testing');
                bastly = require('../browser/javascript/bastlyBrowser.js')({
                    from: testChannel,
                    connector:'192.168.1.234',
                    curaca: '192.168.1.236',
                    apiKey: testApikey,
                    callback: function (data){
                        console.log("got a response " + data);
                    },
                    opsCallback: function (error, data){
                        console.log("got a response " + data);
                        assert.equal(true, error);
                        done();
                    }
                });
            }
        });

        it('should work without giving a opsCallback', function (done) {
            if( opts.library === "ZEROMQ"){
                bastly = require('../node/bastlyZeromq.js');
                bastly = bastly({
                    connector:'192.168.1.234',
                    curaca: '192.168.1.236',
                    from: testChannel,
                    apiKey: testApikey,
                    callback: function (data){
                        console.log("got a response" + data);
                        
                    }
                }); 
            }
            if(opts.library === "SOCKETIO"){
                console.log('socketIO testing');
                bastly = require('../browser/javascript/bastlyBrowser.js')({
                    from: testChannel,
                    connector:'192.168.1.234',
                    curaca: '192.168.1.236',
                    apiKey: testApikey,
                    callback: function (data){
                        console.log("got a response " + data);
                    }                    
                });
            }
            done();
        });

        it('should initialize correctly bastly', function (done) {
            request.post({
                url: 'http://' + IP_CURACA + ":8080" + '/security/apikeys',
                json: true, 
                body:{
                        "action": "create",
                        "limit": 3
                    }
                }, function (error, response, body){
                    console.log('///////////////////////////////////////');
                    console.log(body.apiKey);

                    if( opts.library === "ZEROMQ"){
                    bastly = require('../node/bastlyZeromq.js');
                    bastly = bastly({
                        connector:'192.168.1.234',
                        curaca: '192.168.1.236',
                        from: testChannel,
                        apiKey: testApikey,
                        callback: function (data){
                            console.log("got a response" + data);
                            
                        },
                        opsCallback: function (error, data){
                            console.log("got a response " + data);
                            assert.equal(false, error);
                            done();
                        }
                    }); 
                    }
                    if(opts.library === "SOCKETIO"){
                        console.log('socketIO testing');
                        bastly = require('../browser/javascript/bastlyBrowser.js')({
                            from: testChannel,
                            connector:'192.168.1.234',
                            curaca: '192.168.1.236',
                            apiKey: testApikey,
                            callback: function (data){
                                console.log("got a response " + data);
                            },
                            opsCallback: function (error, data){
                                console.log("got a response " + data);
                                assert.equal(false, error);
                                done();
                            }                   
                        });
                    }
                    done();
                });
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
            bastly.send(testChannel, testData, function(error, data){
                done();
            });
        });
    }); 

    describe('Receives messages sended', function() {
        var receiveTestChannel = "receiveTestChannel";
        it('Message sended is equal to message received', function (done) {
            bastly.subscribe(receiveTestChannel, function messageCb (error, data){
                //must change callback, at this stage many equal messages are send  
                //bastly.on(receiveTestChannel, function(){});
                assert.equal(true,_.isEqual(data, testData));
                console.log('calling done-------------------------------------------------');
                done();
            }, function finishedSubscription (error, data){
                //subscription is completed, send a message
                console.log("sending messages " + error);
                bastly.send(receiveTestChannel, testData);
            });
        });
    }); 

    after(function(){
        bastly.close();
    });
}

