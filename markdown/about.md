> This project is the new content manager under [xonecas.com](http://xonecas.com). 
> It's very minimal and light, developer friendly. The idea 
> is that you can write the dynamic content in markdown and 
> use dust to combine static and dynamic. 

This app is only possible thanks to:
------------------------------------

* HTML5 Boilerplate
* Dust.js
* Markdown

### The gist:

So the build.js file grabs the source files you write and 
compiles them into static assets (@TODO add compression 
and concatenation). The way it knows what to do with your 
files is because it expects a specific folder/naming 
convention.

This app is the example of that convention:


      root/
         build.js                // compiler
         server.js               // static asset provider

         templates/              // home to your pages/views
            index.dust           // root of the app
            pagename.dust        // pagename becomes 
                                 // http://server/pagename

         markdown/               // where your content goes
            keyname.md           // you can refer to this in 
                                 // your template using {keyname}
            section_keyname.md   // you can refer to several
                                 // keynames using {#section}
         htdocs/                 // your static content
            ...
            ...                  // organize it how you want it
                                 // just remember that the .html
                                 // files are created by build.js
                                 // so don't edit them by hand

The default htdocs folder is from HTML5 Boilerplate and so is 
the static file server. One difference is that this app uses 
Ender for the js library, but you're welcome to change it. 
There is also a very simple unique visitors/request counter.

See the example page [here](/about).

Dependencies
------------

* `npm install connect dust node-markdown`

More docs:
----------

* [*HTML5 Boilerplate*  →](http://h5bp.com/)
* [*Dust*  →](http://akdubya.github.com/dustjs/)
* [*Markdown*  →](http://daringfireball.net/projects/markdown/basics)
