
var hooks = require('../lib/sketchplate').hooks,
	config = require('../lib/config').getUserConfig(),
    _ = require('underscore');

/**
 * append the hooks-related help to this CLI menu
 * @param command
 * @return {Command}
 */
exports.appendHelp = function appendHooksHelp( command ){
	return command
        .option('-b, --browse', 'Open project in file browser', '')
        .option('-e, --editor [editor]', 'Launch project in [editor] default editor set to '+ config.editor.cyan, undefined)
		.option('-g, --git-init [remote]', 'Initialize a git repository with template committed, optionally provide a remote URL', '')
		.option('-n, --npm-install', 'Run npm install', '')
		.option('-s, --server [port]', 'Start a static file server with connect on [port]', undefined)
        .option('-v, --verbose', 'Display details including server log');
};


var hasGitInit = function( options ){
    if( options.gitInit.length && options.gitInit.length > 1 ){
        return true;
    }

    var included = false;
    if( options.gitInit === ''){
        options.rawArgs.forEach(function(arg, i){
            if( arg.indexOf('-') === 0 && arg.indexOf('--') === -1 ){
                if( arg.indexOf('g') > 0 ){
                    included = true;
                }
            }
        });

        if (options.rawArgs.indexOf('-g') > -1 || options.rawArgs.indexOf('--git-init') > -1 ){
            included = true;
        }
        return included;
    }
    return included;
};

/**
 * create an array suitable for an async.waterfall
 * @example
 *      async.waterfall(hooks.createWaterfall(options), function(err,directory){});
 * @param options
 * @param waterfall
 * @type {Array} array of watefall functions
 */
exports.createWaterfall = function addHooks( options, waterfall ){
    //since --git-init could be used without specifying a remote we must look at rawArgs
    waterfall = waterfall || [];

	if( hasGitInit(options) ){
        var gitConfig = config.gitInit;
        //remoteURL may end up === true, in which case it will be ignored cause remoteAdd will be false
        var gitInitOptions = _.extend(gitConfig, { remoteAdd: options.gitInit !== '', remoteURL: options.gitInit });
		waterfall.push(function( directory, next ){
            var onMessage = function( message ){
                if( options.verbose ){
                    console.log( message.underline );
                }
            };

            var onComplete = function( err, actionsPerformed ){
                if( err ){
                    err = { id: 'gitInit', message: err.red };
                } else {
                    console.log( 'Git performed: '.green + actionsPerformed.join(', ') );
                }
				next( err, directory);
			};

			hooks.gitInit( directory, gitInitOptions, onComplete, onMessage );
		});
	}
	if( options.npmInstall ){
		waterfall.push(function( directory, next ){
			hooks.npmInstall( directory, function( err ){
                if( err ){
                    err = { id: 'npmInstall', message: 'failed to complete `npm install`'};
                }
				next( err, directory);
			});
		});
	}
	if( options.browse ){
		waterfall.push(function( directory, next ){
			hooks.openInFileBrowser( directory, function( err ){
                if( err ){
                    err = { id: 'browse', message: 'failed to open file browser' };
                }
				next( err, directory );
			});
		});
	}
	if( options.server ){
		var port = options.server;
		if( port === true ){
			port = 3000;
		}
		waterfall.push(function( directory, next ){
            hooks.initServer( directory, {
                port: port,
                incrementPortOnError: options.server === true, //if no port was specified keep trying to find an open one
                verbose: options.verbose
            }, function( err, server, app, port ){
                if( err ){
                    next( {id: 'server', message: 'server failed on port '.red + port +', with: ' + err.message });
                    return;
                }
                console.log('Serving '.cyan+directory+' at:'.cyan+' http://localhost:'+port);
                next( null, directory );
            });
		});
	}
	if( options.editor ){
        //dupe all editors with lowercase versions
        _.each(config.editors, function( val, key ){
            key = key.toLowerCase();
            if( !config.editors[key] ) {
                config.editors[key] = val;
            }
        });

		waterfall.push(function openInEditor( directory, next ){
            var editor = config.editors[ config.editor ];
            // if options.editor is a string, use it to override the editor
            if( options.editor !== true ){
                options.editor = options.editor.toLowerCase();
                if( config.editors[options.editor] ){
                    editor = config.editors[ options.editor ];
                } else {
                    console.log( ('no editor configuration foudn for: ' + options.useEditor ).red );
                    return;
                }
            }
            hooks.openInEditor( directory, editor, function( err ){
                if( err ){
                    err = { id: 'editor', message: 'failed to launch editor, please check your config' };
                }
                next( err, directory );
            });
		});
	}
    return waterfall;
};

