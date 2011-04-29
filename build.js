
// compile markdown and create static files

var fs = require('fs'),
   dust = require('dust'),
   markdown = require("node-markdown").Markdown;

//debug
var ins = require('util').inspect;
function log (data) { console.log(ins(data)); };

// get all my templates and compile them
function readTemplates (callback) {
   fs.readdir('./templates', function (err, templates) {
      if (err) throw err;

      templates.forEach(function (template, index) {
         if (template.match(/\.dust$/)) {
            fs.readFile('./templates/'+template, 'utf8', function (err2, file) {
               if (err) throw err;
               
               template = template.replace('.dust', '');
               var compiled = dust.compile(file, template);
               dust.loadSource(compiled);

               if (index === templates.length-1)
                  callback(templates);
            });
         }
      });
   });
};

/*
function getStats(dir, files, callback) {
   var result = [];
   files.forEach(function (file, index) {
      fs.stat(dir+file, function (err, stats) {
         result.push(stats);
   
         if (index === files.length-1)
            callback(result);
      });
   });
}
*/

// get all markdown files and parse them
function readMarkdown (callback) {
   var htmlContent = {};

   fs.readdir('./markdown', function (err, files) {
      if (err) throw err;

      files.forEach(function (filename, index) {
         if (filename.match(/\.md$/)) {
            fs.readFile('./markdown/'+filename, 'utf8', function (err, file) {
               // look for section pieces
               if (filename.match(/.+\_.+/)) {
                  // @TODO need to sort files by create date
                  // its a section piece
                  var split = filename.split('_'), section = split[0];
                  
                  htmlContent[section] = htmlContent[section] || [];
                  htmlContent[section].push(markdown(file));
               }
               else {
                  filename = filename.replace('.', '_');
                  htmlContent[filename] = markdown(file);
               }

               if (index === files.length-1)
                  callback(htmlContent);
            });
         }
      });
   });
};

// write the files to static folder.
function writeFiles (tmpls, html) {
   tmpls.forEach(function (filename, index) {
      var templateName = filename.replace('.dust', '');
      dust.render(templateName, html, function (err, htmlFile) {
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

