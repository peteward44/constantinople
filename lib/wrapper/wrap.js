const spawnWrap = require('spawn-wrap');
const nodeEnvironment = require( '../nodeEnvironment.js' );

function start() {
	console.log( "WRAPPING" );
	let config = {};
	if ( process.env.LYGOS_CONFIG ) {
		config = JSON.parse( process.env.LYGOS_CONFIG );
	}
	nodeEnvironment.inject( config );
	spawnWrap.runMain();
}

start();
