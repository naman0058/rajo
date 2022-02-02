var mysql = require('mysql')

const pool = mysql.createPool({

   host:'localhost',
   user: 'root',
  password : '123',
    database: 'rajo_app',
    port:'3306' ,
    multipleStatements: true
  })


module.exports = pool;