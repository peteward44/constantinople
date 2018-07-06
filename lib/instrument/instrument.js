const findInsertionPoints = require( './findInsertionPoints.js' );
const insertTracingCode = require( './insertTracingCode.js' );


class FileMetrics {
	constructor( insertionElements ) {
		this._insertionElements = insertionElements;
		this._bumps = new Map();
		for ( let i=0; i<this._insertionElements.length; ++i ) {
			this._bumps.set( i, 0 );
		}
	}

	bump( index, returnValue ) {
		const element = this._insertionElements[index];
		this._bumps.set( index, this._bumps.get( index ) + 1 );
	//	console.log( `element=${JSON.stringify( element )}` );
		return returnValue;
	}

	print() {
		for ( const [ index, frequency ] of this._bumps ) {
			console.log( `index=${index} frequency=${frequency}` );
		}
	}
}


function instrument( filename, content ) {
	const insertionElements = findInsertionPoints( content );
	if ( !global.__coverage__ ) {
		global.__coverage__ = new Map();
	}
	global.__coverage__.set( filename, new FileMetrics( insertionElements ) );

	return insertTracingCode( content, insertionElements );
}

module.exports = instrument;
