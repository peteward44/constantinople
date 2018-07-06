
function stringSplice( str, start, delCount, newSubStr ) {
	return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
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
				// node is a blockstatement - just insert it as our first statement
				content = stringSplice( content, element.node.start + 1, 0, `global.__coverage__.get( __filename ).bump( ${i} );` );
			} else {
				// Otherwise created a new block statement and insert ours as the first statement within
				content = stringSplice( content, element.node.end, 0, ` }` );
				content = stringSplice( content, element.node.start, 0, `{ global.__coverage__.get( __filename ).bump( ${i} ); ` );
			}
		}
	}
	return content;
}


function insertTracingCode( content, insertionElements ) {
	const newContent = modifyCode( content, insertionElements );
	console.log( newContent );
	return newContent;
}

module.exports = insertTracingCode;
