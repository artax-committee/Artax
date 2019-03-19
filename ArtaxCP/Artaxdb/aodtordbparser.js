/**
 * This file has functions that are responsible for converting AOD content to RDB snapshot content.
 */
var datastructure = require("./datastructure.js");
var zgetset = require("./zgetset.js");
var zadd = require("./zadd.js");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var BinaryReader = datastructure.reader.BinaryReader;
var DataReader = datastructure.reader.DataReader;

var close = function (binaryReader, error){
    if (error) console.log (error);

    binaryReader.close (function (error){
        if (error) console.log (error);
    });
};

/**
 * Emitted whenever the snapshot content has been updated from the current AOD content.
 */
eventEmitter.on('snapshotupdated', function() {
  datastructure.fs.writeFile("aod.txt", "", function(err){
  });
});  

var offset;

//Responsible for converting the AOD file content to RDB file content.
var aodtordb = function() {
    
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
              eventEmitter.emit("snapshotupdated");
            });
            
        })
        .read ();
    }
    exports.aodtordb = aodtordb;