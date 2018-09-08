const path = require( 'path' );
const spawn = require( 'child_process' ).spawn;
const spawnWrap = require( 'spawn-wrap' );

function execute( command, args ) {
	const env = {
		LYGOS_CONFIG: "{}"
	};
	spawnWrap( [require.resolve( './execute/wrap.js' )], env );

	return new Promise( ( resolve, reject ) => {
		const proc = spawn( command, args, { cwd: process.cwd(), stdio: 'inherit', maxBuffer: 1024 * 1024 * 10 } );
		proc.on( 'error', ( err ) => reject( err ) );
		proc.on( 'exit', ( exitCode ) => resolve( exitCode ) );
	} );
}

const commands = {
	execute,
	report: function() {}
};

module.exports = {
	commands
};
