const espree = require( 'espree' );
const util = require( 'util' );

function walkAst( node, insertionElements = [] ) {
	if ( node.type === "FunctionDeclaration" ) {
		// add hooks to start / end of function
		insertionElements.push( {
			type: 'FunctionStart',
			loc: node.start + 1
		} );
		insertionElements.push( {
			type: 'FunctionEnd',
			loc: node.end - 1
		} );
	} else if ( node.type === "IfStatement" ) {
		insertionElements.push( {
			type: 'BranchStart',
			loc: node.consequent.start + 1
		} );
		walkAst( node.consequent, insertionElements );
		if ( node.alternate ) {
			insertionElements.push( {
				type: 'BranchStart',
				loc: node.alternate.start + 1
			} );
			walkAst( node.alternate, insertionElements );
		}
	}

	if ( Array.isArray( node.body ) ) {
		for ( const child of node.body ) {
			walkAst( child, insertionElements );
		}
	} else if ( typeof node.body === 'object' ) {
		walkAst( node.body, insertionElements );
	}
	console.log( util.inspect( node ) );
	return insertionElements;
}

function instrument( content ) {
	const ast = espree.parse( content, {
		ecmaVersion: 10
	} );
	const insertionElements = walkAst( ast );
	console.log( `==================` );
	console.log( JSON.stringify( insertionElements, null, 2 ) );
	return content;
}

module.exports = instrument;
