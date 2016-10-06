//Config module, parses config files and holds defaults
var fs = require('fs-extra'),
	path = require('path'),
    _ = require('underscore');


//the internal defaults folder
function getDefaults(){ return path.normalize( __dirname + '/../defaults' ); }
//~/
exports.userHome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
exports.isSudo =  /^\/(var|root)\//.test(exports.userHome);
exports.defaultConfig = getDefaults()+'/config.json';
exports.defaultFetch = getDefaults()+'/fetch.json';
exports.userDirectory = exports.userHome + '/.sketchplate';
exports.userFetch = exports.userDirectory + '/fetch.json';
exports.userConfig = exports.userDirectory + '/config.json';
exports.sketchplatePath = path.normalize(__dirname + '/../bin/');

function swapLeader( from, to, pth ){
    if( pth && pth.indexOf(from) === 0 ){
        return to + pth.substr(from.length, pth.length);
    }
    return pth;
}

var tildeToHome = _.partial(swapLeader, '~', exports.userHome);
var homeToTilde = _.partial(swapLeader, exports.userHome, '~');


/**
 * extract the indices from the list,
 * @param list
 * @param indices
 * @returns {Array}
 */
function extract( list, indices ){
    return _.map(indices, function(index){
        return list[index];
    });
}

exports.parseConfig = function( c ){
    c = _.clone(c);
    return _.extend( c, {
        originalKeys: _.keys(c),
        path: tildeToHome(c.path || '~/.sketchplate/'),
        sketchplatePath: exports.sketchplatePath,
        templatesPath: tildeToHome(c.templatesPath),
        writeUserConfig: _.partial(exports.writeUserConfig, c),
        writeConfig: _.partial(exports.writeConfig, c)
    });
};


//copy file synchronously with fs
var copyFileSync = function( srcFile, destFile ){
    fs.writeFileSync(destFile, fs.readFileSync(srcFile));
};

//take {Config} and strip it back to the original json structure
var restoreFileFormat = function( conf ){
    var o = extract( conf, conf.originalKeys );
    o = _.object( conf.originalKeys, o );
    if( o.path ){
        o.path = homeToTilde( o.path );
    }
    o.templatesPath = homeToTilde( o.templatesPath );
    return o;
};


//get the default settings for sketchplate
exports.getDefaultConfig = function(){
	return exports.load( exports.defaultConfig );
};
//get the users current settings for sketchplate
exports.getUserConfig = function(){
	//if the default config doesnt exist, create it synchronously
	if( !fs.existsSync(exports.userDirectory) ){
		exports.installSync();
	}
    if( !fs.existsSync(exports.userConfig)){
        exports.installConfigDefaults();
    }
    if( !fs.existsSync(exports.userFetch) ){
        exports.installFetchDefaults();
    }
	return exports.load( exports.userConfig );
};
//copy the `defaults` contents into the user dir
exports.installSync = function(){
    var dirname = path.dirname( exports.userConfig );
    try {
        //this is the first time sketchplate has been ran
        fs.copySync(getDefaults(), dirname, { clobber: false });
    } catch( e ){
        console.log("Sketchplate can't create directory at " + dirname + " please fix your user's permissions");
        throw e;
    }
};
//if the .sketchplate folder exists but not the config, copy it over
exports.installConfigDefaults = _.partial( copyFileSync, exports.defaultConfig, exports.userConfig );

//if you already had sketchplate installed but not the fetch.json just copy it over
exports.installFetchDefaults = _.partial( copyFileSync, exports.defaultFetch, exports.userFetch );

//load any config file
exports.load = function( config ){
	return exports.parseConfig( require(config) );
};

//restore configuration file at `path` with the `defaults`
exports.restoreConfig = function( path, cb ){
	var defaultConf = exports.getDefaultConfig();
	exports.writeConfig( path, defaultConf, cb);
};

exports.restoreReadme = function( readmePath, cb ){
    var readme = path.join( getDefaults(), 'README.md' );
    fs.writeFile( readmePath, fs.readFileSync(readme), cb );
};

//write at `path` {Config} newConfig
exports.writeConfig = function( path, newConfig, cb ){
	var body = JSON.stringify( restoreFileFormat(newConfig), null, '    ');
	fs.writeFile( path , body, cb);
};

//restore the user's readme file
exports.restoreUserReadme = _.partial(exports.restoreReadme, path.join(exports.userDirectory,'README.md'));

//restore the user's configuration file with the `default`
exports.restoreUserConfig = _.partial(exports.restoreConfig, exports.userConfig);

//write ther user's configuration file with {Config} newConfig
exports.writeUserConfig = _.partial( exports.writeConfig, exports.userConfig );

