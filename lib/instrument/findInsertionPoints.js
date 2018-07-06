const espree = require( 'espree' );
const util = require( 'util' );


function convertNode( node ) {
	return {
		type: node.type,
		start: node.start,
		end: node.end
	};
}

function pickElement( node ) {
	if ( Array.isArray( node ) ) {
		if ( node.length > 0 ) {
			return convertNode( node[0] );
		}
	} else if ( node && typeof node === 'object' ) {
		return convertNode( node );
	}
	return null;
}


function processFunction( node, insertionElements ) {
	// add hooks to start / end of function
	insertionElements.push( {
		type: 'FunctionStart',
		node: pickElement( node )
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
			node: pickElement( node.consequent ),
			insertionBehaviour: 'wrap'
		} );
		if ( node.alternate ) {
			insertionElements.push( {
				type: 'TernaryStart',
				node: pickElement( node.alternate ),
				insertionBehaviour: 'wrap'
			} );
		}
	} else if ( node.type === "IfStatement" ) {
		// If statement
		insertionElements.push( {
			type: 'BranchStart',
			node: pickElement( node.consequent )
		} );
		if ( node.alternate ) {
			insertionElements.push( {
				type: 'BranchStart',
				node: pickElement( node.alternate )
			} );
		}
	} else if ( node.type === "SwitchCase" ) {
		insertionElements.push( {
			type: 'BranchStart',
			node: pickElement( node.consequent )
		} );
	} else if ( node.type === "WhileStatement" || node.type === "DoWhileStatement" ) {
		insertionElements.push( {
			type: 'BranchStart',
			node: pickElement( node.body )
		} );
	} else if ( node.type === "ForStatement" ) {
		insertionElements.push( {
			type: 'BranchStart',
			node: pickElement( node.body )
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

/**
 * @returns {Array.<insertionPoint>} - List of points within the source code to insert tracing methods
 */
function findInsertionPoints( content ) {
	const m = content.match( /^#.*?\n/ );
	if ( m ) {
		content = content.slice( m[0].length );
	}
	const ast = espree.parse( content, {
		sourceType: 'module',
		ecmaVersion: 10,
		ecmaFeatures: {
			impliedStrict: true
		}
	} );
	return walkAst( ast );
}

module.exports = findInsertionPoints;
