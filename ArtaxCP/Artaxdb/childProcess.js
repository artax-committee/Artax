/**
 * THis file is the child process which mainly handles the file reads and writes.
 */
var datastructure = require("./datastructure.js");
var BinaryReader = datastructure.reader.BinaryReader;
var DataReader = datastructure.reader.DataReader;
var aodtordbparser = require("./aodtordbparser.js");
var zgetset = require("./zgetset.js");
var zadd = require("./zadd.js");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var rdbfile = datastructure.rdbfile;
var intervalid;

process.stdin.resume();

// When SIGINT is recieved
// Convert each line in aod file to rdb file and then stop the child process.
// So that no data will be lost during sudden crash.
process.on('SIGINT', function(){
  clearInterval(intervalid);	
  var aodfile = "aod.txt";
    var rdbfile = datastructure.rdbfile;
    new DataReader (aodfile, { encoding: "utf8" })
        .on ("error", function (error){
            console.log (error);
        })
        .on ("line", function (line, nextByteOffset){
            if(line.toString().indexOf("M") == 0) {
              zgetset.convertLineAodToRdf(line);
            } else if(line.toString().indexOf("ZADD") == 0) {
              zadd.convertLineAodToRdf(line);  
            }
        })
        .on ("end", function (){
            datastructure.fs.writeFile(datastructure.rdbfile, datastructure.rdbfiledata, function (err) {
              if (err) return console.log(err);
              //datastructure.fs.writeFile("aod.txt", "");
              
 
              eventEmitter.emit('closeprocess');
            });
            
            
        })
        .read ();
});

//Event is emitted when process has finished writing the content from aod to rdb file and SIGINT signal is recieved.
eventEmitter.on('closeprocess', function() {
  datastructure.fs.writeFile("aod.txt", "", function(err){
  	process.send("close");
  	process.exit();
  });
  


});

// For every 5 secs convert from aod to rdb.
intervalid = setInterval(function(){
    aodtordbparser.aodtordb();
},5000)



process.on('message', function(m) {

  if(m['message'].toString().indexOf("READSNAPSHOT") == 0) {
     
     datastructure.rdbfiledata = m['data'];
  }else if(m['message'].toString().indexOf("ZSET") == 0) {
  	//Appends the ZSET to AOD file. 
  	var temp_append_line = zgetset.convertLineCommandToAod(m['message'], m['zgetsetjsondata'], m["type"]);
    datastructure.fs.appendFile('aod.txt', temp_append_line + "\n", function (err) {
      if (err) throw err;
    });
  }	else if(m['message'].toString().indexOf("ZADD") == 0) {
  	//Appends the ZADD to AOD file.
    var temp_append_line = zadd.convertLineCommandToAod(m['message'], m['zaddjsondata']);
    datastructure.fs.appendFile('aod.txt', temp_append_line + "\n", function (err) {
      if (err) throw err;
    });
  } else if(m['message'].toString().indexOf("SETBIT") == 0) {
  	//Appends the SETBIT to AOD file.
    var temp_append_line = zgetset.convertLineCommandToAod(m['message'], m['zgetsetjsondata'], m['type']);
    datastructure.fs.appendFile('aod.txt', temp_append_line + "\n", function (err) {
      if (err) throw err;
    });
  } else if(m['message'].toString().indexOf("RDBFILE") == 0) {
  	datastructure.rdbfile = m['data'];
  }
  
});
process.send({ foo: 'bar' });
process.on("exit", function(m){
  
});


