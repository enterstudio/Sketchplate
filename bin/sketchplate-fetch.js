require('colors');

var program = require('commander'),
    _ = require('underscore'),
    userFetch = require('../lib/config').userFetch,
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    sketchplate = require('../lib/sketchplate'),
    hooks = require('../lib/hooks'),
    hooksCli = require('./hooks-cli'),
    config = require('../lib/config').getUserConfig(),
    fetches = JSON.parse(fs.readFileSync(userFetch)),
    plate;


var normalizeFetches = function(){
    //make duplicates of all lowercase for matching
    for( var id in fetches ){
        fetches[id].id = id;
        fetches[id.toLowerCase()] = fetches[id];
    }
};


//parse arguments for names of libs
var getNormalizedNames = function( args ){
    var names = [];
    Array.prototype.forEach.call( args, function( arg ){
        if( arg === undefined ){
            return ;
        }
        if( !arg.options ){
            names.push( arg.toLowerCase() );
        }
    });
    return names;
};

//parse arguments to make sure you have the options object
var getOptions = function( options, args ){
    Array.prototype.forEach.call( args, function( arg ){
        if( arg.options ){
            options = arg;
        }
    });
    return options;
};


program
    .command('get')
    .description('fetch resources for your project')
    .option('-i, --interactive', 'fetch libraries in interactive mode')
    .action(function( options ){
        normalizeFetches();
        names = getNormalizedNames( arguments );
        options = getOptions( options, arguments );
        var waterfall = [];
        //if names were provided and no interactive mode
        //pass them on to defineTargets
        if( names.length > 0 && !options.interactive ){
            waterfall.push(function( next ){
                next( null, names );
            });
        }
        if( options.interactive ){
            waterfall.push(function initInteractive( next ){
                var list = Object.keys( fetches ).sort();
                program.choose( list, function( i ){
                    names.push( list[i] );
                    next( null, names );
                });
            });
        }

        //now we have 1 or more names,
        waterfall.push(function targetsForEach( names, next ){
            // 1 by 1 ask for targets
            var series = [];
            names.forEach(function( name ){
                series.push(function( next ){
                    //prompt for their targets
                    defineTargets( name, next);
                });
            });
            async.series( series, next );
        });
        //now we have targets for every resource,
        //fetch each one
        waterfall.push(function fetchEach( resources, next){
            var series = [];
            resources.forEach(function( resource ){
                series.push(function( next ){
                    sketchplate.fetch( resource, function( err ){
                        console.log( '+\tfetched '.green, resource.id );
                        next( err );
                    });
                });
            });
            async.series( series, next );
        });


        //KICK IT OFF
        ///////////////////////
        async.waterfall( waterfall, exit );
        //////////////////////

        //once the resource has been chosen
        //define where it should go
        function defineTargets( name, callback ){
            var resource = fetches[name];
            var targets = {};
            var series = [];
            if( !resource ){
                var err = new Error("Resource \"" + name + "\" does not exist");
                err.type = "ENOENT";
                callback( err );
                return;
            }
            if( typeof resource.target === 'object'){
                //for every name create a function to prompt for its destination
                Object.keys( resource.target ).forEach(function( src ){
                    series.push(function( next ){
                        //prompt for destination for every target
                        program.prompt("destination for \""+src+"\": ", function( destination ){
                            var to = path.resolve( destination );
                            //add this destination to the target
                            targets[src] = to;
                            next( null );
                        });
                    });
                });
                async.series( series, function( err ){
                    //return a complete fetch object by adding targets to it
                    resource.target = targets;
                    callback( err, resource);
                });

            } else {
                //no target has been specified, act like its one file
                if( typeof resource.target === 'undefined' || typeof resource.target === 'string' ){
                    var defaultDes = '';
                    if( resource.target ){
                        defaultDes = resource.target;
                    } else if ( resource.file ){
                        defaultDes = resource.file.substr( resource.file.lastIndexOf('/')+1, resource.file.length );
                    }

                    program.prompt("destination for \""+name+"\" ("+defaultDes+") : ", function( destination ){
                        if( destination.length === 0 && defaultDes !== '' ){
                            destination = defaultDes;
                        }
                        var to = path.resolve( destination );
                        resource.target = to;
                        callback( null, resource );
                    });
                }
            }
        }


        function exit( err ){
            if( err ){
                if( err.type === 'ENOENT' ){
                    console.log( err.message.red );
                }
                throw err;
            }
            process.exit();
        }

    });



program
    .command('list')
    .option('-v, --verbose', 'Verbose logging of configurations')
    .description('list resources in your fetch.json')
    .action(function( options ){
        var fetches = require( require('../lib/config').userFetch );
        console.log('Sketchplate hast the following fetch processes in `fetch.json`:'.cyan);
        _.each( fetches, function( ftch, id ){
            var via = '';
            via += ftch.www ? '(www)'.blue : '     ';
            via += (ftch.file ? '(file)  ' : ftch.zip ? '(zip)   ' : ftch.clone ? '(clone) ' : '(invalid)').cyan;
            console.log( via + id );
            if( options.verbose ){
                console.log( JSON.stringify(ftch, null, '  ') );
            }
        });
    });

program
    .command('www <name>')
    .option('-b, --browse', 'Open this URL in browser')
    .description('Print and/or browse your fetch resources website url')
    .action(function( name, options ){
        normalizeFetches();
        name = name.toLowerCase();
        var resource = fetches[name];

        if( !resource ){
            console.log( ('no "www" found for ' + name).red );
        } else {
            console.log( resource.www );
            if( options.browse ){
                hooks.openInFileBrowser( resource.www, function( err ){
                });
            }
        }

    });

program
    .option('-e, --edit', 'edit fetch.json in your editor')
    .option('-p, --printpath', 'print the path to fetch.json');

program.parse( process.argv );

if( program.printpath ){
    console.log(userFetch);
    process.exit();
    return;
}

if( program.edit ) {
    hooks.openInEditor( userFetch, config.editors[ config.editor ], function( err ){

    });
}
