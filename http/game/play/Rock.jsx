import React, { Component, PropTypes } from 'react';

function Rock({ y, present }) {
	const rockStyle = {
		height: '100%',
	};
	let containerStyle = {
		textAlign: 'center',
		height: '12%',
		margin: '0 auto',
		transform: `translate(0px, ${y}px)`,
		display: 'table',
	};
	if (!present) containerStyle.display = 'none';
	return (
		<div style={containerStyle}>
			<img src="../img/obstacles/rock.svg" style={rockStyle} alt="" />
		</div>
	);
}

export default Rock;
