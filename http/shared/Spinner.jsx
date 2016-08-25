import React from 'react';

export default function Spinner() {
	const centerStyle = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100vw',
		height: '50vh',
	};
	return (
		<div style={centerStyle}>
			<div className="spinner">
				<div className="bounce1" />
				<div className="bounce2" />
				<div className="bounce3" />
			</div>
		</div>
	);
}
