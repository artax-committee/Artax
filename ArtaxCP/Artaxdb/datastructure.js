//This file contains the datastructures, in which the main memory content is stored.

var jsondata = {};
jsondata = {};
jsondata['zgetset'] = {};
jsondata["zadd"] = {};
exports.jsondata = jsondata;
//File reader and writer.
var fs = require('fs');
exports.fs = fs;
var reader = require ("buffered-reader");
exports.reader = reader;
//RDB snap shot path.
var rdbfile = 'rdb.txt';
exports.rdbfile = rdbfile;
//RDB napshot content.
var rdbfiledata = '';
exports.rdbfiledata = '';


