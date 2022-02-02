var mysql = require('mysql')

const pool = mysql.createPool({

   host:'db-mysql-sfo2-83388-do-user-10742627-0.b.db.ondigitalocean.com',
   user: 'doadmin',
  password : 'SUlSXYMpVo2fdHQM',
    database: 'rajo_app',
    port:'25060' ,
    multipleStatements: true
  })


module.exports = pool;