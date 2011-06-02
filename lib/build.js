// modules
var fs = require('fs'),
   dust = require('dust'),
   markdown = require("node-markdown").Markdown;

// helper functions
// read files from directory
function fetch (path, ext, cb) {
   var readFiles = [];

   fs.readdir(path, function (err, files) {
      if (err) return cb(err);

      var len = files.length;

      !function reader (i) {
         var filename = files[i],
            re = new RegExp("\\."+ ext +"$");

         if (i === len)
            return cb(null, readFiles);

         else if (re.test(filename)) {
            fs.readFile(path + filename, 'utf8', function (err, src) {
               if (err) return cb(err);

               readFiles.push({
                  "name": filename,
                  "src": src
               });
               reader(i+1);
            });
         }
         else
            reader(i+1);
      } (0);

   });
}

function write (path, files, cb) {
   var len = files.length;
   !function writer (i) {
      if (i === len)
         return cb(null);
      else {
         var file = files[i];
         fs.writeFile(path + file.name, file.src, "utf8", function (err) {
            if (err) return cb(err);
            
            writer(i+1);
         });
      }
   } (0);
}

function marky (cb) {
   // fecth mardown files
   fetch("./markdown/", "md", function (err, files) {
      if (err) return cb(err);

      var content = {};
      // parse markdown
      files.forEach(function (file, index) {
         var name = file.name.replace(/\..+$/, "");
         content[name] = markdown(file.src);
      });
   
      cb(null, content);
   });
}

function dusty (content, cb) {
   // fecth html file templates
   fetch("./htdocs/", "html", function (err, files) {
      // compile the templates
      files.forEach(function (file, index) {
         console.log(file);
         var c = dust.compile(file.src, file.name);
         dust.loadSource(c);
      });

      // dust
      var len = files.length;
      !function duster (i) {
         if (i === len)
            return cb(null, files);

         else {
            var file = files[i];
            dust.render(file.name, content, function (err, html) {
               if (err) return cb(err);

               file.src = html;               

               duster(i+1);
            });
         }
      } (0);
   });
}

module.exports = function (prod, hint) {
   // mardown
   marky(function (err, content) {
      if (err) throw err;
      // dust
      dusty(content, function (err, htmlFiles) {
         if (err) throw err;
         // write them down
         write("./static/", htmlFiles, function (err) {
            if (err) throw err;
            console.log("* HTML files complete.");
         });
      });
   });
}

   // fecth css files
   // compress them
   // write the files

   // fecth the js files
   // optional jshint
   // minify files
   // concatenate in this order:
      // /libs/*
      // plugins.js

      
   




