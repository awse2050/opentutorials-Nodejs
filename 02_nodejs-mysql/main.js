console.log('Hello no deamon');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var db = require("./lib/db.js");
var topic = require('./lib/topic');
var author = require('./lib/author');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') { // 기본페이지로 들어올 때, 
        if(queryData.id === undefined) { // 상세페이지가 아니면
            topic.home(request, response);
        } else { // 상세페이지로 들어갔을 경우.
            topic.page(request, response);
        }
    } else if(pathname === '/create') { 
        // 글 작성페이지
        topic.create(request, response);
    } else if(pathname === '/create_process') {
        // 글 작성시
        topic.create_process(request, response);
    } else if(pathname === '/update') {
        // 수정 페이지
        topic.update(request, response);
    } else if(pathname === '/update_process') {
        // 수정 진행시
        topic.update_process(request, response);
    } else if(pathname === '/delete_process') {
        // 삭제 진행시
       topic.delete_process(request, response);
    } else if(pathname === '/author') {
        author.home(request, response);
    } else if(pathname === '/author/create_process') {
        author.create_process(request, response);
    } else if(pathname === '/author/update') {
        author.update(request, response);
    } else if(pathname === '/author/update_process') {
        author.update_process(request, response);
    } else if(pathname === '/author/delete_process') {
        author.delete_process(request, response);
    } else { 
        // 이외의 페이지로 들어갔을 경우 에러
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
