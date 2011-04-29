
// compile markdown and create static files

var fs = require('fs'),
   dust = require('dust'),
   markdown = require("node-markdown").Markdown;

// little tweak to dust
dust.optimizers.format = function(ctx, node) { return node };

//debug
var ins = require('util').inspect;
function log (data) { console.log(ins(data)); };

// get all my templates and compile them
function readTemplates (callback) {
   fs.readdir('./templates', function (err, templates) {
      if (err) throw err;

      var tmpls = [];
      templates.forEach(function (template, index) {
         if (template.match(/\.dust$/) && !template.match(/(^|\/)\./)) {
            fs.readFile('./templates/'+template, 'utf8', function (err2, file) {
               if (err) throw err;
               
               template = template.replace('.dust', '');
               var compiled = dust.compile(file, template);
               dust.loadSource(compiled);
               tmpls.push(template+'.dust');

               if (index === templates.length-1) {
                  callback(tmpls);
               }
            });
         }
      });
   });
};

// reads the filenames and stats from a dir
function readdir(dir, callback) {
   fs.readdir(dir, function (err, files) {
      if (err) throw err;

      var result = [];
      files.forEach(function (file, index) {
         if (/^\.|\/\./.test(file)) return;

         fs.stat(dir+'/'+file, function (err2, stats) {
            if (err2) throw err2;

            stats.name = file;
            result.push(stats);
      
            // sort files by creation date
            if (index === files.length-1) {
               result.sort(function (a, b) {
                  return +new Date(a.ctime) - +new Date(b.ctime);
               });
               callback(result);
            }
         });
      });
   });
}

// get all markdown files and parse them
function readMarkdown (callback) {
   var htmlContent = {};

   readdir('./markdown', function (files) {
      var counter = files.length;
      files.forEach(function (fileStats, index) {
         var filename = fileStats.name;
         if (filename.match(/\.md$/)) {
            fs.readFile('./markdown/'+filename, 'utf8', function (err, file) {
               if (err) throw err;

               // look for section pieces
               if (filename.match(/.+\_.+/)) {
                  // its a section piece
                  var split = filename.split('_'), section = split[0];
                  
                  htmlContent[section] = htmlContent[section] || [];
                  htmlContent[section].push(markdown(file));
               }
               else {
                  filename = filename.replace('.', '_');
                  htmlContent[filename] = markdown(file);
               }

               counter--;
               if (counter === 0) {
                  callback(htmlContent);
               }
            });
         }
      });
   });
};

// write the files to static folder.
function writeFiles (tmpls, html) {
   tmpls.forEach(function (filename, index) {
      if (filename === undefined) return;

      var templateName = filename.replace('.dust', '');
      dust.render(templateName, html, function (err, htmlFile) {
         if (err) throw err;

         filename = './htdocs/'+filename.replace('.dust', '.html');
         fs.writeFile(filename, htmlFile, function (err) {
            if (err) throw err;

            console.log(" -!- Wrote: "+filename+" -!- ");
         });

      });
   });
};

// get the ball going
readTemplates(function (tmpls) {
   readMarkdown(function (html) {
      writeFiles(tmpls, html);
   });
});

