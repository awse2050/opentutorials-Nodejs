var mysql = require('mysql'); // mysql 모듈 선언
// mysql 모듈 설정
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'opentutorials'
});

connection.connect();
// query 메서드를 통해서 질의문만 전달한다.
connection.query('select * from topic', function(error, results, fields) {
    if(error) {
        console.log(error);
    }

    console.log(results);
});

connection.end();