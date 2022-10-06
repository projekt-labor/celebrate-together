"use strict";
const mysql = require('mysql');


const DB = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'celebrate_together'
});

module.exports = DB;
