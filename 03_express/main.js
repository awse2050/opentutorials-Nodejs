console.log('Hello no deamon');
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression'); // 압축 미들웨어 사용.
const { send } = require('process');
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

app.get('/', function(request, response) {
    console.log(request.list);
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
        `<h2>${title}</h2><p>${description}</p>
        <img src="/images/coke.png" style="width: 300px; display: block; margin-top: 10px;">
        `,
        `<a href="/create">create</a>`
    );
    response.send(html);
})

app.get('/page/:pageId', function(request, response, next) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
        if(err) {
            next(err);
        } else {

            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags:['h1']
            });
            var list = template.list(request.list);
            var html = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
                `<a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                <form action="/delete_process" method="post">
                    <input type="hidden" name="id" value="${sanitizedTitle}">
                    <input type="submit" value="delete">
                </form>`
            );
            response.send(html);
        }
    });
})

app.get("/create", function(request, response) {
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `, '');
    response.send(html);
})

app.post("/create_process", function(request, response) {
    // 미들웨어를 통해서 요청시 내부적으로 결과값을 받아낼 수 있게 되었다.
    console.log(request.body);
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
        response.writeHead(302, {Location: `/page/${title}`});
        response.end();
    });
})

app.get("/update/:pageId", function(request, response) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                <p>
                    <textarea name="description" placeholder="description">${description}</textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update/${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
    });
})

app.post('/update_process', function(request, response) {
    
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.redirect(`/page/${title}`)
        });
    });
})

app.post('/delete_process', function(request, response) {
    
    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error) {
        response.redirect('/');
    });
})

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

// var app = http.createServer(function(request, response) {
//     var _url = request.url;
//     var queryData = url.parse(_url, true).query;
//     var pathname = url.parse(_url, true).pathname;

//     if(pathname === '/') {
//         if(queryData.id === undefined) {
//             fs.readdir('./data', function(error, filelist) {
//                 var title = 'Welcome';
//                 var description = 'Hello, Node.js';
//                 var list = template.list(filelist);
//                 var html = template.HTML(title, list,
//                     `<h2>${title}</h2><p>${description}</p>`,
//                     `<a href="/create">create</a>`
//                 );
//                 response.writeHead(200);
//                 response.end(html);
//             });
//         } else {
//             fs.readdir('./data', function(error, filelist) {
//                 var filteredId = path.parse(queryData.id).base;
//                 fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
//                     var title = queryData.id;
//                     var sanitizedTitle = sanitizeHtml(title);
//                     var sanitizedDescription = sanitizeHtml(description, {
//                         allowedTags:['h1']
//                     });
//                     var list = template.list(filelist);
//                     var html = template.HTML(sanitizedTitle, list,
//                         `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
//                         `<a href="/create">create</a>
//                         <a href="/update?id=${sanitizedTitle}">update</a>
//                         <form action="delete_process" method="post">
//                             <input type="hidden" name="id" value="${sanitizedTitle}">
//                             <input type="submit" value="delete">
//                         </form>`
//                     );
//                     response.writeHead(200);
//                     response.end(html);
//                 });
//             });
//         }
//     } else if(pathname === '/create') {
//         fs.readdir('./data', function(error, filelist) {
//             var title = 'WEB - create';
//             var list = template.list(filelist);
//             var html = template.HTML(title, list, `
//                 <form action="/create_process" method="post">
//                     <p><input type="text" name="title" placeholder="title"></p>
//                     <p>
//                         <textarea name="description" placeholder="description"></textarea>
//                     </p>
//                     <p>
//                         <input type="submit">
//                     </p>
//                 </form>
//             `, '');
//             response.writeHead(200);
//             response.end(html);
//         });
//     } else if(pathname === '/create_process') {
//         var body = '';
//         request.on('data', function(data) {
//             body = body + data;
//         });
//         request.on('end', function() {
//             var post = qs.parse(body);
//             var title = post.title;
//             var description = post.description;
//             fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
//                 response.writeHead(302, {Location: `/?id=${title}`});
//                 response.end();
//             });
//         });
//     } else if(pathname === '/update') {
//         fs.readdir('./data', function(error, filelist) {
//             var filteredId = path.parse(queryData.id).base;
//             fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
//                 var title = queryData.id;
//                 var list = template.list(filelist);
//                 var html = template.HTML(title, list,
//                     `
//                     <form action="/update_process" method="post">
//                         <input type="hidden" name="id" value="${title}">
//                         <p><input type="text" name="title" placeholder="title" value="${title}"></p>
//                         <p>
//                             <textarea name="description" placeholder="description">${description}</textarea>
//                         </p>
//                         <p>
//                             <input type="submit">
//                         </p>
//                     </form>
//                     `,
//                     `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
//                 );
//                 response.writeHead(200);
//                 response.end(html);
//             });
//         });
//     } else if(pathname === '/update_process') {
//         var body = '';
//         request.on('data', function(data) {
//             body = body + data;
//         });
//         request.on('end', function() {
//             var post = qs.parse(body);
//             var id = post.id;
//             var title = post.title;
//             var description = post.description;
//             fs.rename(`data/${id}`, `data/${title}`, function(error) {
//                 fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
//                     response.writeHead(302, {Location: `/?id=${title}`});
//                     response.end();
//                 });
//             });
//         });
//     } else if(pathname === '/delete_process') {
//         var body = '';
//         request.on('data', function(data) {
//             body = body + data;
//         });
//         request.on('end', function() {
//             var post = qs.parse(body);
//             var id = post.id;
//             var filteredId = path.parse(id).base;
//             fs.unlink(`data/${filteredId}`, function(error) {
//                 response.writeHead(302, {Location: `/`});
//                 response.end();
//             });
//         });
//     } else {
//         response.writeHead(404);
//         response.end('Not found');
//     }
// });
// app.listen(3000);
