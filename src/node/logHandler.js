module.exports = function(opts){
    
    var log;    
    // CHECK
    if(!opts || !opts.name){
        throw new Error('name for child logger required');
    }
    
    if(!opts || !opts.log){
        var bunyan = require('bunyan');
        log = bunyan.createLogger({name: "atahualpa:"+ opts.name});   
    } else {
        log = opts.log.child({'component' : opts.name});
    }

    return log;
};

