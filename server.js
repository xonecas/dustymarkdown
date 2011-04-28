// author: Sean Caetano Martin (xonecas)
// 
//

// add some mime-types
var mime = require('mime');

// define early so that connect sees them
mime.define({
   'application/x-font-woff': ['woff'],
   'image/vnd.microsoft.icon': ['ico'],
   'image/webp': ['webp'],
   'text/cache-manifest': ['manifest'],
   'text/x-component': ['htc'],
   'application/x-chrome-extension': ['crx']
});

var connect = require('connect'),
   // tracking storage :-)
   url = require('url'),
   _ = require('underscore'),
   requests = 0, uniques = {},
   // inspect tool, I use it all the time.
   inspect = require('util').inspect;

// uncomment this if you plan on concatenate files
// var fs = require('fs');

// concatenate files, ahead of server start for better performance
// for high concurrency servers this step's callback must init the
// server or the files being requested might not be ready.
// read and merge jquery and js/script.js
/*
fs.readFile(__dirname+'/js/libs/jquery-1.5.js', 'utf8', function (err, jquery) {
   fs.readFile(__dirname+'/js/script.js', 'utf8', function (err, script.js) {
      fs.writeFile(__dirname+'/js/bundle.js', jquery + script, 'utf8', function (err) {
         if (err) throw err;
         // file is written
      });
   });
});
*/


var routes = function (app) {
   // tracking route
   app.get('/track', function (req, res, next) {
      res.end();
      var key = url.parse(req.url, true).query.key;

      requests++;

      if (uniques[key])
         uniques[key]++;
      else
         uniques[key] = 1;
      // look for this on your logs
      console.log("\n+++ requests: "+requests+"; "+
         "uniques: "+_.size(uniques)+"\n");
   });




   // this must be the last route, its an addition to the static provider
   app.get('*', function (req, res, next) {
      var pathname = url.parse(req.url).pathname;
      if (!/\..+$/.test(pathname) && pathname !== '/')
         req.url += ".html";

      var reqPath = req.url;

      // use this header for html files, or add it as a meta tag
      // to save header bytes serve it only to IE
      // user agent is not always there
      var userAgent = req.headers['user-agent'];
      if (userAgent && userAgent.indexOf('MSIE') && 
         reqPath.match(/\.html$/) || reqPath.match(/\.htm$/))
         res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1");

      // protect .files
      if (reqPath.match(/(^|\/)\./))
         res.end("Not allowed");

/*
      // control cross domain if you want
      // req.header.host will be the host of the incoming request
      var hostAddress = "example.com",
         reqHost = req.headers.host;

      // allow cross domain (for your subdomains)
      // disallow other domains.
      // you can get really specific by adding the file
      // type extensions you want to allow to the if statement
      if (reqHost && reqHost.indexOf(hostAddress) === -1)
         res.end("Cross-domain is not allowed");
*/

      next(); // let the static server do the rest
   });
}

// set you cache maximum age, in milisecconds.
// if you don't use cache break use a smaller value
var oneMonth = 1000 * 60 * 60 * 24 * 30;

// start the server
var server = connect.createServer(
   // good ol'apache like logging
   // you can customize how the log looks: 
   // http://senchalabs.github.com/connect/middleware-logger.html
   connect.logger(),

   // call to trigger routes
   connect.router(routes),

   // set to ./ to find the boilerplate files
   // change if you have an htdocs dir or similar
   // maxAge is set to one month
   connect.static(__dirname+'/htdocs', {maxAge: oneMonth})
);

server.listen(6661);

// Your server is running :-)
console.log('Node server is running!');

process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});
