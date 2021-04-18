console.log('Hello no deamon');
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression'); // 압축 미들웨어 사용.
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');

// 미들웨어 전달
app.use(bodyParser.urlencoded({ extended: false }));
// 사용자가 POst로 전달한 데이터를 내부적으로 분석해서 결과를 전달해준다.
app.use(compression());
// public  디렉토리에서 파일을 찾겟다는 의미.
app.use(express.static('public'));

//미들웨어 만들기, 아래와 같은 3개의 인자를 받도록 만든다.
app.get('*', function(request, response, next) {
    //반복되는 로직을 선언
    fs.readdir(`./data`, function(error, filelist) {
        request.list = filelist;
        next();
    });
});

app.use('/', indexRouter);
app.use('/topic', topicRouter);

// 에러처리 코드 
app.use(function(req, res, next) {
    res.status(404).send('Sorry cant fine that!');
})

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('something broke');
});

app.listen(3000, function() {
    console.log("example app listening on port 3000!");
})