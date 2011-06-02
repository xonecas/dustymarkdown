// author: Sean Caetano Martin (xonecas)
var builder = require("./lib/build.js");
builder(false, false);

var connect = require('connect'),
   url = require('url');
   inspect = require('util').inspect;

var routes = function (app) {
   // this must be the last route, its an addition to the static provider
   app.get('*', function (req, res, next) {
      var pathname = url.parse(req.url).pathname;
      if (!/\..+$/.test(pathname) && pathname !== '/')
         req.url += ".html";

      var reqPath = req.url;

      var userAgent = req.headers['user-agent'];
      if (userAgent && userAgent.indexOf('MSIE') && 
         reqPath.match(/\.html$/) || reqPath.match(/\.htm$/))
         res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1");

      // protect .files
      if (reqPath.match(/(^|\/)\./))
         res.end("Not allowed");

      next(); // let the static server do the rest
   });
}

var oneMonth = 1000 * 60 * 60 * 24 * 30;
// start the server
var server = connect.createServer(
   connect.logger("* :date * :remote-addr * :method * :url * \
:status * :user-agent"),

   connect.router(routes),
   connect.static(__dirname+'/static', {maxAge: oneMonth})
);

server.listen(6661);

// Your server is running :-)
console.log('Node server is running!');

/*
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});
*/
