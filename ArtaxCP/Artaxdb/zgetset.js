/**
 * This file handles the following operations.
 * ZSET,ZGET,SETBIT,GETBIT.
 */

var datastructure = require("./datastructure");

/**
 * This handles the set command.
 */
var zset = function(key, value) {
  datastructure.jsondata['zgetset'][key] = ["string",value];

}
exports.zset = zset;

/**
 * This handles the get command.
 */
var zget = function(key) {
	if(datastructure.jsondata['zgetset'][key][0] == "string") {
	  if(key in datastructure.jsondata.zgetset)
	    return datastructure.jsondata['zgetset'][key][1];
	}
	return "nil";
}
exports.zget = zget;


/**
 * This handles the set bit command.
 */
var zsetbit = function(key, position, value) {
	var current_value = 0;
	if(key in datastructure.jsondata.zgetset) {
		if(position<=7){
		  current_value = datastructure.jsondata.zgetset[key][1][position];
		  datastructure.jsondata.zgetset[key][1][position] = value;
		  	
		}
	} else {
      datastructure.jsondata.zgetset[key] = ['bits', []];
      for(i=0; i<=7; i++) {

      	datastructure.jsondata.zgetset[key][1].push(0);
      }
      if(position<=7){
		  datastructure.jsondata.zgetset[key][1][position] = value;
		}
	}
	return current_value;
}
exports.zsetbit = zsetbit;

/**
 * This handles the getbit command.
 */
var zgetbit = function(key, position) {
	if(key in datastructure.jsondata.zgetset) {
		if(datastructure.jsondata.zgetset[key][0] == 'bits')
		  return datastructure.jsondata.zgetset[key][1][position];
	}
	return 0;
}

//Converts the given line from aod file to rdf and places in the rdffiledata.
var convertLineCommandToAod = function(line, zgetsetjsondata, type) {
  var line_split = line.split(" ");
  key = line_split[1];
  var aod_line = "M " + key;
  if(type == "string") {
  	aod_line = aod_line + " " + type + " " + zgetsetjsondata[key][1];
  } else if(type == "bits") {
  	aod_line = aod_line + " " + type + " " + zgetsetjsondata[key][1].join(" ");
  }
  
  return aod_line;
}
exports.convertLineCommandToAod = convertLineCommandToAod;

exports.zgetbit = zgetbit;

//Converts the given line from aod file to rdf and places in the rdffiledata.
var convertLineAodToRdf = function(line) {
  var line_split = line.toString().split(" ");
  var rdbfiledata_split = datastructure.rdbfiledata.toString().split("@@@");
  replace_line_key = "M " + line_split[1];
  replace_line_value = "" + line;
  var line_exists = false;
  for(var i=0; i<rdbfiledata_split.length; i++) {
    if(rdbfiledata_split[i].toString().indexOf(replace_line_key) == 0) {
      rdbfiledata_split[i] =  replace_line_value;
      line_exists = true;
      break; 
    }
  }
  if(!line_exists) {
  	rdbfiledata_split[rdbfiledata_split.length] = replace_line_value;
  }
  datastructure.rdbfiledata = rdbfiledata_split.join("@@@");
  //datastructure.rdbfiledata = datastructure.rdbfiledata + replace_line_value + "\n"; 

}
exports.convertLineAodToRdf = convertLineAodToRdf;

//Converts the RDB line snapshot to json.
var convertLineRdbToJson = function(line) {
  var line_split = line.split(" ");
  var key = line_split[1];
  var type = line_split[2];
  if(type == "bits") {
  	var k=3;
  	
  	datastructure.jsondata['zgetset'][key] = ["bits", []];
  	for(var i=0; i<8; i++) {
  		datastructure.jsondata['zgetset'][key][1].push(line_split[k]);
  		k++;
  	}
  }	else if(type == "string") {
  	datastructure.jsondata['zgetset'][key] = ["string", line_split[3]];
  }
}
exports.convertLineRdbToJson = convertLineRdbToJson;