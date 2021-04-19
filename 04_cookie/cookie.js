var http = require('http');
// 쿠키 모듈추가
var cookie = require('cookie');

http.createServer(function(req, res) {
    console.log(req.headers.cookie);
    var cookies = {};
    if(req.headers.cookie !== undefined) {
        cookies = cookie.parse(req.headers.cookie); // 쿠키들을 객체화 시킨다.
    }
    console.log(cookies)
    console.log(cookies.yummy_cookie);
    // res.writeHead(200, {
    //     'Set-Cookie': ['yummy_cookie=choco', 'tasty_cookie=strawberry',
    //     `Permanent=cookies; Max-Age=${60*60*24*30}`,
    //     `HttpOnly=HttpOnly; HttpOnly`,
    //     `Secure=Secure; Secure`,
    //     `Path=Path; Path=/cookie`,
    //     `Domain=Domain; Domain=o2.org`]
    // });
    res.end('cookie!');
}).listen(3000);