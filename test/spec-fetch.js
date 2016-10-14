/*global describe, it, after*/
var fetch = require('../lib/fetch'),
    fs = require('fs-extra');


describe('fetch', function(){
	var tmp = 'test_fetch/';

    //delete all the files created at the end
    after(function(){
        fs.removeSync(tmp);
    });


	describe('batch', function(){
		var dir = tmp + 'batch/';
		it('should download all files, including a zip, clone, and file', function( done ){
			this.timeout(0);
			fetch([{
				"zip": "https://github.com/hapticdata/toxiclibsjs/zipball/master",
				"target": {
					"lib/": dir+"toxiclibsjs/javascripts/",
					"examples/": dir+"toxiclibsjs/examples/"
				}
			},{
				"clone": "https://github.com/Modernizr/Modernizr.git",
				"target": {
					"src": dir+"modernizr/",
                    "readme.md": dir+"modernizr/"
				}
			},{
				"file": "http://code.jquery.com/jquery.js",
				"target": dir+"jquery.js"
			}], function( err ){
				done(err);
			});
		});
	});

	describe("#fromFile()", function(){
		it('should download jquery.js from a file', function( done ){
			this.timeout(10000);
			fetch({
				"file": "http://code.jquery.com/jquery-1.10.2.js",
				"target": tmp + "from-file/jquery.js"
			},function( err ){
				done( err );
			});
		});
	});

	describe("#fromGit()", function(){
		it('should clone dat-gui with git', function( done ){
			this.timeout( 100000 );
			fetch({
				"clone": "https://github.com/dataarts/dat.gui",
				"target": {
					"src/dat": tmp + "from-git/dat",
					"build": tmp + "from-git/build"
				}
			}, function( err ){
				done( err );
			});
		});
        it('should clone toxiclibsjs and checkout the v0.1.3 tag', function( done ){
            this.timeout( 0 );
            fetch({
                "clone": "https://github.com/hapticdata/toxiclibsjs.git",
                "tag": "v0.1.3",
                "target": {
                    "lib/toxi": tmp + "from-git/toxi-tag"
                }
            }, done );
        });

        it('should clone toxiclibsjs and checkout the `feature-color` branch', function( done ){
            this.timeout( 100000 );
            fetch({
                "clone": "https://github.com/hapticdata/toxiclibsjs.git",
                "branch": "feature-color",
                "target":  tmp + "from-git/toxi-branch"
            }, done );
        });

        it('should use globs to copy targets of directories and individual files', function(done){
            this.timeout( 0 );
            fetch({
                "clone": "https://github.com/hapticdata/toxiclibsjs.git",
                "exclude": [
                    "lib/toxi/geom.js",
                    "lib/toxi/geom/**/*",
                    "lib/toxi/internals/"
                ],
                "target": {
                    "lib/toxi/**/*": tmp + "from-git/toxi-individual-target",
                    "*.md": tmp + "from-git/toxi-individual-target",
                    "package.json": tmp + "from-git/toxi-individual-target/package.json" //<- the destination package.json is optional
                }
            }, done);

        });
	});


	describe("#fromZip()", function(){
		it('should download bootstrap as a zipball', function( done ){
			this.timeout( 100000 );
			fetch({
				"zip": "https://github.com/twbs/bootstrap/archive/master.zip",
				"excludes": [ "js/tests/", "less/tests/" ],
				"target": {
					"js/": tmp + "from-zip/bootstrap/javascripts",
					"less/": tmp + "from-zip/bootstrap/less/"
				}
			}, function( err ){
				done( err );
			});
		});
	});

	describe("error handling", function(){
		it('should report that an invalid resource was provided', function( done ){
			this.timeout(10000);
			fetch({ "test": "" }, function( err ){
				if( err ){
					//this is what we want
					err = null;

				}
				done( err );
			});
		});
		it('should respond with a retrieval error', function( done ){
			this.timeout(10000);
			fetch({
				file: "http://github.com/dkaljdkd",
				target: tmp+"error/"
			}, function( err ){
				if( err ){
					//this is what we want! so now we can eradicate it
					err = null;
				}
				done( err );
			});
		});
	});

    /*describe("download tweenlite", function(){
        it('should download tweenlites zip file', function(){
            fetch({
                "zip": "http://www.greensock.com/dl/greensock-v12-js.zip",
                "target": {
                    "src/" : "javascripts/vendor/tweenlite"
                }
            }, function( err ){
                done( err );
            });
        });
    });*/
});
