const mysql = require('mysql')
const connection = mysql.createConnection({
    host: '192.168.50.210',
    user: 'elliott',
    password: 'elle1412',
    database: 'spit'
})



module.exports = connection