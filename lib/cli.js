const spawnWrap = require( 'spawn-wrap' );
const spawn = require( 'child_process' ).spawn;

function getArgs() {
	for ( let i=0; i<process.argv.length; ++i ) {
		const arg = process.argv[i];
		if ( arg === '--' ) {
			return process.argv.slice( i + 1 );
		}
	}
	return [];
}

function start() {
	const env = {
		LYGOS_CONFIG: "{}"
	};
	spawnWrap( [require.resolve( './wrapper/wrap.js' )], env );
	
	const cmdArgs = getArgs();
	if ( cmdArgs.length === 0 ) {
		console.error( `No command provided on command line` );
		return;
	}
	console.log( cmdArgs.join( " " ) );
	const proc = spawn( cmdArgs[0], cmdArgs.slice(1), { cwd: process.cwd(), stdio: 'inherit', maxBuffer: 1024 * 1024 * 10 } );
	proc.on( 'error', ( err ) => {
		console.error( "err", err.stack );
	} );
	proc.on( 'exit', ( exitCode ) => {
		
	} );
}

start();
