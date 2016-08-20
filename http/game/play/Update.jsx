import React, { Component, PropTypes } from 'react';

function Update({ title, text, animationText }) {
	return (
		<div className={animationText} id="notification">
			<div className="container">
				<div className="row">
					<div className="twelve columns">
						<h2 className="marginless"><b>{title}</b></h2>
						<h2>{text}</h2>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Update;
