const spawnWrap = require('spawn-wrap');
const path = require( 'path' );
const Module = require( 'module' );
const instrument = require( './instrument/instrument.js' );

let origCompile = null;

function compileOverride( content, filename ) {
	// Check if we should instrument this file
	const relPath = path.relative(process.cwd(), filename);
	const doInstrumentation = true;// fnmatch(relPath, self.config.files);
	if ( doInstrumentation ) {
		console.log( 'Instrumenting:', filename );
		content = instrument( filename, content );
	}
	origCompile.call( this, content, filename );
}

function inject( config ) {
	process.on( 'exit', () => {
		for ( const [ filename, metrics ] of global.__coverage__ ) {
			console.log( `===${filename}` );
			metrics.print();
		}
	} );

	origCompile = Module.prototype._compile;
	Module.prototype._compile = compileOverride;
}

function start() {
	console.log( "WRAPPING" );
	let config = {};
	if ( process.env.LYGOS_CONFIG ) {
		config = JSON.parse( process.env.LYGOS_CONFIG );
	}
	inject( config );
	spawnWrap.runMain();
}

start();
