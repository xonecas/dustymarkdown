// modules
var fs = require('fs'),
   jsp = require("uglify-js").parser,
   pro = require("uglify-js").uglify,
   dust = require('dust'),
   sqwish = require('sqwish').minify,
   kompressor = require('htmlKompressor'),
   markdown = require("node-markdown").Markdown;

dust.optimizers.format = function(ctx, node) { return node };

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

// html, markdown dust handlers
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

function html (min, cb) {

   // mardown
   marky(function (err, content) {
      if (err) return cb(err);
      // dust
      dusty(content, function (err, htmlFiles) {
         if (err) return cb(err);

         //@TODO compress html
         if (min) htmlFiles.forEach(function (file, idx) {
            htmlFiles[idx].src = kompressor(file.src, true);
         });

         // write them down
         write("./static/", htmlFiles, function (err) {
            if (err) return cb(err);
            console.log("* HTML files complete.");
            cb(null);
         });
      });
   });
}

function css (min, cb) {
   // get the css
   fetch("./htdocs/css/", "css", function (err, cssFiles) {
      if (err) return cb(err);

      if (min) {
         cssFiles.forEach(function (file, idx) {
            cssFiles[idx].src = sqwish(file.src);
         });    
      }  

      write("./static/css/", cssFiles, function (err) {
         if (err) return cb(err);

         console.log("* CSS files complete.");               
         cb(null);
      });
   });
}

function uglify (orig_code) {
   var ast = jsp.parse(orig_code); // parse code and get the initial AST
   ast = pro.ast_mangle(ast); // get a new AST with mangled names
   ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
   var final_code = pro.gen_code(ast); // compressed code here

   return final_code;
}

function libs (cb) {
   fetch("./htdocs/js/libs/", "js", function (err, libs) {
      if (err) return cb(err);

      write("./static/js/libs/", libs, function (err) {
         if (err) return cb(err);

         console.log("* JS Libs complete.");
         cb(null);
      });
   });
}

function js (min, cb) {
   fetch("./htdocs/js/", "js", function (err, jsFiles) {
      if (err) return cb(err);

      if (min) jsFiles.forEach(function (file, idx) {
         jsFiles[idx].src = uglify(file.src);
      });

      write("./static/js/", jsFiles, function (err) {
         if (err) return cb(err);

         console.log("* JS Files complete (min: "+min+").");
         cb(null);
      });
   });
}

module.exports = function (prod) {
   html(prod, function (err) {
      if (err) throw err;

      css(prod, function (err) {
         if (err) throw err;

         libs(function (err) {
            if (err) throw err;
            
            js(prod, function (err) {
               if (err) throw err;
            });
         });
      });
   });
}


