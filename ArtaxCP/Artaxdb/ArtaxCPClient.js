var net = require('net');

/**
 * This file contains the client side tcp/ip code.
 */

var sys = require("sys");

var HOST = '127.0.0.1';
var PORT = "15000";

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write('I am Chuck Norris!');
    var stdin = process.openStdin();

    stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a line feed.  so we (rather crudely) account for that  
    // with toString() and then substring() 
    client.write(d.toString());
    console.log("you entered: [" + 
        d.toString().substring(0, d.length-1) + "]");
  });
});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    
    console.log('DATA: ' + data);
    // Close the client socket completely
    client.destroy();
      
});

// Add a 'connection close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});