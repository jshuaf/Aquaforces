import React from 'react';

const Leaderboard = React.createClass({
	// MARK: make leaderboard sort
	render() {
		const style = {
			borderStyle: 'dotted',
			borderColor: 'green',
			borderWidth: 1.0,
		};
		return (
			<div>
			<h4><strong>Leaderboard</strong></h4>
			{
				Object.keys(this.props.crews).map(function (crewNumber, i) {
					const crew = this.props.crews[crewNumber];
					return <LeaderboardEntry crewNumber={crewNumber} crewPosition={crew.position} key={i} />;
				}.bind(this))
			}
			</div>
		);
	},
});

const LeaderboardEntry = React.createClass({
	render() {
		let style = {
			fontSize: (this.props.crewPosition + 1) * 15 + 'px',
			padding: 5 + this.props.crewPosition + 'px',
		};
		return (<div className="leaderboardEntry">
		<h5>Crew {this.props.crewNumber}: <span style={style} className="pill">{Math.round(this.props.crewPosition * 10) / 10}</span></h5>
		</div>);
	},
});

export default Leaderboard;
