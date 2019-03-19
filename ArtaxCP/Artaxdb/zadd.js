/**
 * This file handles the following operations.
 * ZADD,ZRANGE,ZCARD,ZCOUNT.
 */

var datastructure = require("./datastructure");

/**
 * This is the implementation of zadd command.
 */
var zadd = function(key, score, value) {

  //Check if the key exists aldready in the object.
  if(key in datastructure.jsondata['zadd']) {
    //Check if the score exists in key.
    if(score in datastructure.jsondata["zadd"][key]) {

      datastructure.jsondata["zadd"][key][score].push(value.toString());
    } else {
      datastructure.jsondata["zadd"][key][score] = Array();	
      datastructure.jsondata["zadd"][key][score].push(value.toString());	
    }
  } else {
  	datastructure.jsondata['zadd'][key] = {};
  	datastructure.jsondata["zadd"][key][score] = Array();
  	datastructure.jsondata["zadd"][key][score].push(value.toString());
  }
}
exports.zadd = zadd;

/**
 * This is the implementation of zrange command.
 */
var zrange = function(key, from_score, to_score) {
  var temp_values = Array();	
  if(key in datastructure.jsondata['zadd']) {
  	var temp_scores = Object.keys(datastructure.jsondata['zadd'][key]);
    //Sorting the scores.
    temp_scores = temp_scores.sort();
    var populate_scores = Array();
    for(var i=0; i<temp_scores.length;i++) {
      if(to_score == -1 && temp_scores[i]>=from_score) {
      	populate_scores.push(temp_scores[i]);
      } else if(temp_scores[i]>=from_score && temp_scores[i]<=to_score) {
      	populate_scores.push(temp_scores[i]);
      }

    }
    for(var i=0; i<populate_scores.length; i++) {
       var score = populate_scores[i];
       if(score in datastructure.jsondata["zadd"][key]) {
         for(var j=0; j<datastructure.jsondata["zadd"][key][score].length; j++) {
           temp_values.push(datastructure.jsondata["zadd"][key][score][j]);
         }
      }
    }
    
    return temp_values;
  } 
  return "nil";	
}

exports.zrange = zrange;

/**
 * This is the implementation of zcard command.
 */
var zcard = function(key) {
  var total_count = 0;
  if(key in datastructure.jsondata['zadd']) {
    //Check if the score exists in key.
    for(var propt in datastructure.jsondata['zadd'][key]) {
      total_count = total_count + datastructure.jsondata['zadd'][key][propt].length;
    }
    return total_count;
  } 	
  return 0;
}
exports.zcard = zcard;


/**
 * This is the implementation of zcount command.
 */
var zcount = function(key, from_score, to_score) {
  var cardinality = 0;

  if(key in datastructure.jsondata['zadd']) {

  	var temp_scores = Object.keys(datastructure.jsondata['zadd'][key]);
    console.log("temp scores");
    console.log(temp_scores);
    //Sorting the scores.
    temp_scores = temp_scores.sort();
    var populate_scores = Array();
    for(var i=0; i<temp_scores.length;i++) {
      if(to_score == -1 && temp_scores[i]>=from_score) {
      	populate_scores.push(temp_scores[i]);
      } else if(temp_scores[i]>=from_score && temp_scores[i]<=to_score) {
      	populate_scores.push(temp_scores[i]);
      }

    }
    //Check if the score exists in key.
    for(var i=0; i<populate_scores.length; i++) {
      var score = populate_scores[i];
      if(score in datastructure.jsondata["zadd"][key]) {
      	 console.log(datastructure.jsondata['zadd'][key][score].length);
         cardinality = cardinality + datastructure.jsondata['zadd'][key][score].length;
      } 
    }
    return cardinality;
  }
  return 0;
}

exports.zcount = zcount;


//Converts each command string given by user to aod format.
var convertLineCommandToAod = function(line, zaddjsondata) {
  var line_split = line.split(" ");
  key = line_split[1];
  var aod_line = "ZADD " + key;
  var scores = zaddjsondata[key];
  aod_line = aod_line + " " + Object.keys(scores).length;
  for(var propt in scores) {
  	aod_line = aod_line + " " + propt;
  	var values = scores[propt];
  	aod_line = aod_line + " " + values.length;
  	for(var i = 0; i<=values.length-1; i++) {
      aod_line = aod_line + " " + values[i];		
  	}
  }
  return aod_line;
}
exports.convertLineCommandToAod = convertLineCommandToAod;

//Converts the given line from aod file to rdf and places in the rdffiledata.
var convertLineAodToRdf = function(line) {
  var line_split = line.split(" ");
  var rdbfiledata_split = datastructure.rdbfiledata.toString().split("@@@");
  replace_line_key = "ZADD " + line_split[1];
  replace_line_value = "" + line;
  var line_exists = false;

  for(var i=0; i<rdbfiledata_split.length; i++) {
    if(rdbfiledata_split[i].toString().indexOf(replace_line_key) == 0) {
      rdbfiledata_split[i] =  replace_line_value;
      line_exists = true; 
    }
  }
  if(!line_exists) {
  	rdbfiledata_split[rdbfiledata_split.length] = replace_line_value;
  }
  datastructure.rdbfiledata = rdbfiledata_split.join("@@@");

}
exports.convertLineAodToRdf = convertLineAodToRdf;

//Convert each line in rdb to json data, thats nothing but local cache.
var convertLineRdbToJson = function(line) {
  var line_split = line.split(" ");
  var key = line_split[1];
  var no_scores = line_split[2];
  var k = 3;
  var j = 3;
  datastructure.jsondata.zadd[key] = {};
  for(var i =0; i< no_scores; i++) {
    var score = line_split[k];
    k++;
    datastructure.jsondata.zadd[key][score] = Array();
    var no_values = line_split[k];
    k++;
    for(var j=0;j<no_values;j++) {
      datastructure.jsondata.zadd[key][score].push(line_split[k]);
      k++;
    }
  }
}
exports.convertLineRdbToJson = convertLineRdbToJson;