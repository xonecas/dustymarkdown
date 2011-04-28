
// compile markdown and create static files

var fs = require('fs'),
   dust = require('dust'),
   markdown = require("node-markdown").Markdown;

//debug
var ins = require('util').inspect;
function log (data) { console.log(ins(data)); };

/*
var index = fs.readFileSync('./templates/index.dust', 'utf8');
var compiledIndex = dust.compile(index, 'index');
dust.loadSource(compiledIndex);
*/

// get all my templates and compile them
function readTemplates (callback) {
   fs.readdir('./templates', function (err, templates) {
      if (err) throw err;

      var len = templates.length, dir = "./templates/";

      // asynchronous loop
      (function loop (i) {
         if (i < len) {
         var template = templates[i];
            if (/\.dust$/.test(template)) {
               fs.readFile(dir+template, 'utf8', function (err, file) {
                  if (err) throw err;

                  template = template.replace('.dust', '');
                  var compiled = dust.compile(file, template);
                  dust.loadSource(compiled);

                  loop(i+1);
               });
            } else {
               loop(i+1);
            }
         } 
         else {
            callback(templates);
         }
      }) (0);
   });
};

// get all markdown files and parse them
function readMarkdown (callback) {
   fs.readdir('./markdown', function (err, files) {
      if (err) throw err;

      var len = files.length, html = {};

      (function reader (i) {
         if (i < len) {
            var filename = files[i];
            if (filename.match(/\.md$/)) {
               fs.readFile('./markdown/'+filename, 'utf8', function (err2, file) {
                  if (err2) throw err2;

                  if (filename.match(/.+\_.+/)) {
                     var split = filename.split('_'),
                        section = split[0];
                     filename = split[1];

                     html[section] = html[section] || [];
                     html[section].push(markdown(file));
                  } else {
                     filename = filename.replace('.', '_');
                     html[filename] = markdown(file);
                  }

                  reader(i+1);
               });
            }
            else {
               reader(i+1);
            }
         }
         else  
            callback(html);
      }) (0);
   });
};

function writeFiles (tmpls, html) {
   var len = tmpls.length;

   (function writer (i) {
      if (i < len) {
         var filename = tmpls[i].replace('.dust', '.html');
         dust.render(filename.replace('.html',''), html, function (err, htmlFile) {
            fs.writeFile('./htdocs/'+filename, htmlFile, function (err) {
               if (err) throw err;
               
               console.log('+++ Wrote: '+filename);
               writer(i+1);
            });
         });
      }
   }) (0);
};

readTemplates(function (tmpls) {
   readMarkdown(function (html) {
      writeFiles(tmpls, html);
   });
});

/*
fs.readdir('./markdown', function (err, files) {
   if (err) throw err;

   log(files);

   var html = {}, len = files.length;

   function writer (html) {
      log(html);
      dust.render("index", html, function (err, indexHtml) {
         log (indexHtml);
         fs.writeFile('./htdocs/index.html', indexHtml, function (err2) {
            console.log("+++ wrote index");
         });
      });
   }

   (function reader (i) {
      var filename = files[i];
      if (i < len && filename.match(/\.md$/)) {
         fs.readFile('./markdown/'+filename, 'utf8', function (err2, file) {
            if (err2) throw err2;
            filename = filename.replace('.', '_');
            html[filename] = markdown(file);
            reader(i+1);
         });
      }
      else if (i < len)
         reader(i+1);
      else  
         writer(html);
   }) (0);
});
*/

