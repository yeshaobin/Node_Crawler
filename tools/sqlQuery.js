const mysql = require('mysql')

let options = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'root',
  database: 'sobook',
  useConnectionPooling: true,
  connectTimeout:6000*6000,
  connectionLimit: 50,
  queueLimit: 0,
  waitForConnection: true
  
}
let connection = connect()
// let connection = mysql.createConnection(options)
function handleError (err) {
  if (err) {
    console.log(err)
    // 如果是连接断开，自动重新连接
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connection = connect();
    } else {
      console.error(err.stack || err);
    }
  }
}

// 连接数据库
function connect () {
  let connection = mysql.createConnection(options);
  connection.connect(handleError);
  connection.on('error', handleError);
  return connection
}

async function myQuery(strSql,arr=[]){
  return new Promise((resolve, reject)=>{
    connection.query(strSql,arr,(err,result,fields)=>{
      if(err){
        reject(err)
      }else {
        resolve(result)
      }
    })
    
  })
}
module.exports = myQuery
