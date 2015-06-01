/*
var openOriginal = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {
    arguments[2] = false;
    return openOriginal.apply(this, arguments);
};
*/
var HttpClient = function() {
    console.log('helllooo');
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.onreadystatechange = function() { 
            console.log(anHttpRequest);
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) {
                aCallback(false, anHttpRequest.response);
            } 
        };
        anHttpRequest.send( null );
    };
    this.post = function(aUrl, data, aCallback) {
        var anHttpRequest = new XMLHttpRequest();

        anHttpRequest.open( "POST", aUrl, true);            
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) {
                //console.log(anHttpRequest);
                aCallback(false, anHttpRequest.response);
            } 
        };
        anHttpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        anHttpRequest.send(JSON.stringify(data));
    };
};
aClient = new HttpClient();

var request = require('request');
module.exports = function(opts){

    describe('Sanity check', function() {
        this.timeout(15000);
        it('tests work', function (done) {
            var url = "http://192.168.1.34:3000";
            request.get(url, function(error, response, body){
                console.log(error); 
                console.log(response); 
                console.log(body); 
            });
            /*
            aClient.get(url, function (error, response) {
                
                console.log('?', response);
                if (!error) {
                    console.log('Worker got!', response);
                    var msg = JSON.parse(response);
                    var workerIp = msg.message.ip;
                    callback(workerIp);
                    done();
                } else {
                    console.log('error getting worker');
                    //console.log(response);
                }
            });
            */
        });
    });

};

