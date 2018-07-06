const espree = require( 'espree' );
const util = require( 'util' );


function processFunction( node, insertionElements ) {
	// add hooks to start / end of function
	insertionElements.push( {
		type: 'FunctionStart',
		node
	} );
}


function testAstNode( node, insertionElements ) {
	if ( Array.isArray( node ) ) {
		for ( const child of node ) {
			walkAst( child, insertionElements );
		}
	} else if ( node && typeof node === 'object' ) {
		walkAst( node, insertionElements );
	}
}


function walkAst( node, insertionElements = [] ) {
	console.log( util.inspect( node ) );
	if ( node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression" ) {
		// Anonymous functions
		processFunction( node, insertionElements );
	} else if ( node.type === "FunctionDeclaration" && typeof node.body === "object" && node.body.type === "BlockStatement" ) {
		// Named functions
		processFunction( node.body, insertionElements );
	} else if ( node.type === "ConditionalExpression" ) {
		// Ternary operators
		insertionElements.push( {
			type: 'TernaryStart',
			node: node.consequent,
			insertionBehaviour: 'wrap'
		} );
		if ( node.alternate ) {
			insertionElements.push( {
				type: 'TernaryStart',
				node: node.alternate,
				insertionBehaviour: 'wrap'
			} );
		}
	} else if ( node.type === "IfStatement" ) {
		// If statement
		insertionElements.push( {
			type: 'BranchStart',
			node: node.consequent
		} );
		if ( node.alternate ) {
			insertionElements.push( {
				type: 'BranchStart',
				node: node.alternate
			} );
		}
	} else if ( node.type === "SwitchCase" ) {
		const picked = Array.isArray( node.consequent ) ? node.consequent[0] : node.consequent;
		insertionElements.push( {
			type: 'BranchStart',
			node: picked
		} );
	} else if ( node.type === "WhileStatement" ) {
		insertionElements.push( {
			type: 'BranchStart',
			node: node.body
		} );
	}
	
	testAstNode( node.body, insertionElements );
	testAstNode( node.declarations, insertionElements );
	testAstNode( node.init, insertionElements );
	testAstNode( node.cases, insertionElements );
	testAstNode( node.consequent, insertionElements );
	testAstNode( node.alternate, insertionElements );

	return insertionElements;
}

function stringSplice( str, start, delCount, newSubStr ) {
	return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
}


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


function modifyCode( content, insertionElements ) {
	// sort insertion elements by location, so we insert them from the bottom of the file upwards. This way we don't invalidate the
	// existing locations when modifying the code
	insertionElements.sort( ( lhs, rhs ) => rhs.node.start - lhs.node.start );
	for ( let i=0; i<insertionElements.length; ++i ) {
		const element = insertionElements[i];
		if ( element.insertionBehaviour === 'wrap' ) {
			// Ternary operators need to be handled a little differently - we wrap the statement in our bump() function and bump() returns the value we pass to it
			content = stringSplice( content, element.node.end, 0, ` )` );
			content = stringSplice( content, element.node.start, 0, `global.__coverage__.get( __filename ).bump( ${i}, ` );
		} else {
			if ( element.node.type === "BlockStatement" ) {
				content = stringSplice( content, element.node.start + 1, 0, `global.__coverage__.get( __filename ).bump( ${i} );` );
			} else {
				content = stringSplice( content, element.node.end, 0, ` }` );
				content = stringSplice( content, element.node.start, 0, `{ global.__coverage__.get( __filename ).bump( ${i} ); ` );
			}
		}
	}
	return content;
}


function instrument( filename, content ) {
	const ast = espree.parse( content, {
		sourceType: 'module',
		ecmaVersion: 10,
		ecmaFeatures: {
			impliedStrict: true
		}
	} );
	const insertionElements = walkAst( ast );

	if ( !global.__coverage__ ) {
		global.__coverage__ = new Map();
	}
	global.__coverage__.set( filename, new FileMetrics( insertionElements ) );

	console.log( `==================` );
	//console.log( JSON.stringify( insertionElements, null, 2 ) );
	console.log( `==================` );
	const newContent = modifyCode( content, insertionElements );
	console.log( newContent );
	return newContent;
}

module.exports = instrument;
