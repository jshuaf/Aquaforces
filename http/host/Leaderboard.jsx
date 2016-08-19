import React, { PropTypes } from 'react';

const Leaderboard = ({ crews }) => {
	// MARK: make leaderboard sort
	return (
		<div>
		<h4><strong>Leaderboard</strong></h4>
		{
			Object.keys(crews).map((crewNumber, i) => {
				const crew = crews[crewNumber];
				return <LeaderboardEntry crewNumber={crewNumber} crewPosition={crew.position} key={i} />;
			})
		}
		</div>
	);
};

Leaderboard.propTypes = {
	crews: PropTypes.shape({
		name: PropTypes.string.isRequired,
		users: PropTypes.arrayOf(PropTypes.string).isRequired,
		position: PropTypes.number.isRequired,
		status: PropTypes.string.isRequired,
		boat: PropTypes.string.isRequired,
	}).isRequired,
};

const LeaderboardEntry = ({ crewNumber, crewPosition }) => {
	const style = {
		fontSize: `${(crewPosition + 1) * 15}px`,
		padding: `${5 + crewPosition}px`,
	};
	return (
		<div className="leaderboardEntry">
			<h5>Crew {crewNumber}:
				<span style={style} className="pill">
					{Math.round(crewPosition * 10) / 10}
				</span>
			</h5>
		</div>
	);
};

LeaderboardEntry.propTypes = {
	crewNumber: PropTypes.number.isRequired,
	crewPosition: PropTypes.number.isRequired,
};

export default Leaderboard;
