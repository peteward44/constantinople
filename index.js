const path = require( 'path' );
const Module = require( 'module' );

const origCompile = Module.prototype._compile;

function compileOverride( content, filename ) {
	// Check if we should instrument this file
	const relPath = path.relative(process.cwd(), filename);
	const instrument = true;// fnmatch(relPath, self.config.files);

	if ( instrument ) {
		console.log( 'Instrumenting:', filename );
		console.log( content );

		// // The content of a node Module needs to get wrapped in a function, otherwise it might be invalid (esprima won't like it otherwise).
		// // We wrap it like node.js is wrapping (see Module.prototype._compile), since this logic might change we
		// // check that the wrapping is done using 2 parts, if not just skip the wrapping and hope esprima won't fail :)
		// var wrapped = true;
		// if (Module.wrapper.length === 2) {
			// // It is important to add the \n between wrapper[0] and content as we don't want any user functions to
			// // be in the first line of the file (we assume in the injector that the first line is the module wrapping function only)
			// content = Module.wrapper[0] + '\n' + content + Module.wrapper[1];
		// } else {
			// wrapped = false;
			// console.log('WARN !! It seems like the node.js version you are using has changed and might be incompatible with njsTrace');
		// }

		// try {
			// content = injector.injectTracing(filename, content, self.config.wrapFunctions, self.config.inspectArgs, wrapped);

			// // If we wrapped the content we need now to remove it as node.js original compile will do it...
			// if (Module.wrapper.length === 2) {
				// content = content.substring(Module.wrapper[0].length, content.length - Module.wrapper[1].length);
			// }

			// self.log('Done:', filename);
		// } catch(ex) {
			// self.log('ERROR: Error instrumenting file:', filename, ', Exception:', ex);
		// }
	}

	// And continue with the original compile...
	origCompile.call( this, content, filename );
}


function inject() {
	Module.prototype._compile = compileOverride;
}

inject();

require( './test.js' );
