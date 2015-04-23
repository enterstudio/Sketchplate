require('colors');
var program = require('commander'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	sketchplate = require('../lib/sketchplate'),
	hooks = require('../lib/hooks'),
    config = require('../lib/config'),
	userConfig = config.getUserConfig();




program
	.command('editor')
	.description('setup your editor, currently `'+userConfig.editor.cyan+'`')
	.option('-i, --interactive','Set up your editor in interactive mode')
	.action(function( options ){
		var list = [];
		for( var prop in userConfig.editors ){
			list.push( prop );
		}
		program.choose( list, function( choice ){
			userConfig.editor = list[choice];
			userConfig.writeUserConfig(function( err ){
				if( err ) throw err;
				process.exit();
			});
		});
	});

program
	.command('templates <path>')
	.description('change the directory of your templates, currently `'+userConfig.templatesPath.cyan+'`')
	.action(function( pth ){
		userConfig.templatesPath = path.resolve( pth );
		userConfig.writeUserConfig(function( err ){
			if( err ) throw err;
			process.exit();
		});
	});

program
	.command('restore')
	.description('restore your config.json to the default settings')
	.action(function(){
		userConfig.restoreUserConfig(function( err ){
			if ( err ){
				throw err;
			}
			console.log("Config restored to defaults");
		});
	});

program.option('-e, --edit', 'Edit config.json in your editor');

program.parse( process.argv );

if( program.edit || program.args.length === 0 ){
	hooks.openInEditor( config.userDirectory, userConfig.editors[ userConfig.editor ],  function( err ){

	});
}
