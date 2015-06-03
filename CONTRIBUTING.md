#Rationale
/src/bastlyBase.js is the shared interface that will be exposed to clients
/src/node/ is where everything that is only node related resides
/src/browser/ is where everything that is only browser related resides

#node 
gulp test-node
gulp watch-test-node
//creates a build in /build/node
gulp production-node 

#test-browser 
gulp test-browser
gulp watch-test-browser
//creates a build in /build/browser
gulp production-browser 
