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
			<div className="sk-chasing-dots">
				<div className="sk-child sk-dot1" />
				<div className="sk-child sk-dot2" />
			</div>
		</div>
	);
}
