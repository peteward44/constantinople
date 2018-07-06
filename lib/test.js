
function start() {
	const foo = 'bar';
	if ( foo === 'bar' ) {
		console.log( foo );
	} else {
		console.log( "none" );
	}
	const bar = foo ? 2 : 5;
	switch ( 4 ) {
		case 0:
		console.log( "0" );
		break;
		case 1: {
		console.log( "0" );
		} break;
		case 2: {
		console.log( "0" );
		break; }
		case 3:
		console.log( "0" );
		break;
	}
	let whileCondition = true;
	let index = 0;
	while ( whileCondition ) {
		index++;
		if ( index > 10 ) {
			break;
		}
	}
	while ( whileCondition ) whileCondition = !whileCondition;
	
}

start();
