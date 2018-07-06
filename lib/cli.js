const lygos = require( './index.js' );

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
	const cmdArgs = getArgs();
	if ( cmdArgs.length === 0 ) {
		console.error( `No command provided on command line` );
		return;
	}
	lygos.commands.execute( cmdArgs[0], cmdArgs.slice(1) )
	.catch( err => {
		console.error( err.stack );
		process.exitCode = 1;
	} );
}

start();
