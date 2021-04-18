var http = require('http');

http.createServer(function(req, res) {
    res.writeHead(200, {
        'Set-Cookie': ['yummy_cookie=choco', 'tasty_cookie=strawberry']
    });
    res.end('cookie!');
}).listen(3000);