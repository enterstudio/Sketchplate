# Sketchplate
##pre-project tooling for getting started quick

Sketchplate is a system for quickly generating projects with the collections of libraries and processes that you use frequently. It provides tools to maintain various templates, retrieve and update your favorite libraries, quickly copy your template into a specified folder and launch it in your favorite editor. It is published on [NPM](http://npmjs.org) for [Node.js](http://nodejs.org). Sketchplate currently supports OSX. Support for Linux and Windows is in future plans.

There are currently 3 main components to sketchplate:

1.	[Templates](#templates) - create and manage your own templates
1.	[Fetching](#fetching) - manage and automate retrieval of external resources
1.	[Hooks](#hooks) - express execution of common tasks after project creation

##Installation
	$ npm install -g sketchplate

##Creating your first new project
	$ sketchplate new ./my-sketchplate-project

##CLI Interface

	  Usage: sketchplate <command> [options]

Options:

		-h, --help     output usage information
		-V, --version  output the version number

Commands:

-	[new](#new) [options] <location> - create a new project at \<location\> with hooks for [options]
-	[template](#template) [options] [command] - perform commands on your sketchplate templates
-	[fetch](#fetch) [options] [names…] - perform resource fetches on your templates
-	[config](#config) [options] [command] - edit your sketchplate configuration


##new
Specify the location for the new project and any combinations of [hooks](#hooks) to perform upon completion

	Usage: sketchplate new [options] <location>

	Options:

	-h, --help                 output usage information
	-t, --template [template]  Create with [template] template
	-g, --gitinit              Initialize repo after creation
	-n, --npminstall           Run npm install on the new project
	-s, --skipeditor           Skip opening project in editor
	-b, --browse               Open project in file browser


##template

	Usage: sketchplate template [options] [command]

Sketchplate encourages creating your own project templates and comes bundled with one called [amd-sketch](#default-template-amd-sketch).

	Commands:

	add [name]
	add a new template
	
	edit [options] [name]
	edit an existing template
	
	fetch [options] [names…]
	fetch resources for a template
	
	remove <name>
	remove an existing template
	
	set <name>
	set the default template, currently `amd-sketch`

	Options:

	-h, --help  output usage information
	-l, --list  List all sketchplate templates

##fetch

	Usage: sketchplate fetch [options] [names…]

To assist in maintaining templates, a [template.json](./templates/amd-sketch/template.json) is used to describe resources, the retrieval and updating of those resources is automated and **doesn't use any package manager** _([Volo](http://github.com/jrburke/volojs), [Bower](http://github.com/twitter/bower))_.

	Options:

	-h, --help                 output usage information
	-a, --all                  Fetch new copies of all resources for template
	-i, --interactive          Fetch resources individually in interactive mode
	-l, --list                 List the template's fetch resources
	-t, --template [template]  Fetch resources for [template]


To use, you simply describe where it is, and where you want its contents to go.
_currently supports **file**,**zip**,**clone**:_

###Download a file, copy it to the target:

	{
		"file": "https://raw.github.com/Modernizr/Modernizr/master/modernizr.js",
		"target": "js/vendor/modernizr.js"
	}

###_git clone_ a repository and copy its `src/dat` folder into `js/vendor/dat`:

	{
		"clone": "https://code.google.com/p/dat-gui/",
		"target": {
			"src/dat": "js/vendor/dat"
		}
	}

###Download a zip, extract it, copy its targets:

	{
		"zip": "https://github.com/twitter/bootstrap/zipball/master",
		"target": {
			"js/": "js/vendor/bootstrap",
			"less/": "less/bootstap"
		}
	}

##Config

	Usage: sketchplate config [options] [command]

	Commands:

	editor [options] 
	setup your editor
	
	templates <path>
	change the directory of your templates, currently `../templates`

	Options:

	-h, --help  output usage information
	-e, --edit  Edit the config.json in your editor


###Editors
Set your editor to one of the following with:

	sketchplate config editor

1. Sublime Text 2 (osx)
1. Textmate (osx) ([install shell support](http://blog.macromates.com/2011/mate-and-rmate/))
1. BBEdit (osx) (select install command-line support on welcome screen)
1. WebStorm (osx)
1. Vim (osx)
1. Sublime Text 2 $PATH (subl) - launch ST2 on a computer where `subl` has been added to $PATH

**Add many other editors easily.** Say you have [coda-cli](http://justinhileman.info/coda-cli/) (or [Command-Line-Coda](https://github.com/egonSchiele/Command-Line-Coda)) installed and want to use Coda as your editor:

1.	launch your config.json in your editor with `sketchplate config`
1.	add `"coda": ["coda", "%path"]` to the `"editors"`
1.	change `"editor"` to `"coda"`

You can also edit any of the editors to use additional flags. The token `%path` will be replaced with the project path.


##Hooks
Once a new project has been created there are several things you may want to do immediately. Each of these are available as options on `sketchplate new [options] <location>`

1.	Open your editor to begin working (on by default `-s` to skip the editor)
1.	`-b` Browse the newly created project
1.	`-g` Initialize an empty git repository
1.	`-n` run `npm install` to install node dependencies _(if the template has a `package.json`)_



##Default template [amd-sketch](https://github.com/hapticdata/Sketchplate/blob/master/templates/)
The default template is of minimal structure and is oriented towards web-based computational design sketches. These libraries are assembled together to work with the [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) workflow I prefer. 
### The default libraries in the template are:
* [Require.js](http://requirejs.org) - with [domReady](https://github.com/requirejs/domReady) and [text](https://github.com/requirejs/text) plugins bundled
* [jquery](http://jquery.com)
* [dat-gui](http://code.google.com/p/dat-gui/)
* [toxiclibsjs](http://haptic-data.com/toxiclibsjs)
* [underscore.js](http://documentcloud.github.com/underscore/)
* [backbone.js](http://documentcloud.github.com/backbone/)
* [three.js](http://mrdoob.github.com/three.js/)
* [Stats.js](http://github.com/mrdoob/stats.js/)
* [d3](http://github.com/mbostock/d3)
* [modernizr](http://modernizr.com)

All of these libraries will be fetched the first time automatically, they are placed in a `javascripts/vendor` folder with a matching [configuration file](https://github.com/hapticdata/Sketchplate/blob/master/templates/amd-sketch/template/javascripts/config.js) ([ more about require.js shim config](http://requirejs.org/docs/api.html#config-shim) ). Only resources that you reference in your project will ever be loaded or included in a built project. The output directory structure is setup to easily be moved into a [node.js](http://nodejs.org) + [express.js](http://expressjs.com) file structure

Created by [Kyle Phillips](http://haptic-data.com) on April 8th, 2012