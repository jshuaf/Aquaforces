import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import TextInput from '../shared/TextInput.jsx';
import { toggleSearchFilterSource } from './actions';
import { searchQuestionSets } from './thunks';

class SearchBarDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	search() {
		const query = this.input.node.value;
		this.props.searchQuestionSets(query);
	}
	toggleSearchSource(source) {
		this.props.toggleSearchFilterSource(source);
	}
	render() {
		const formStyle = {
			marginBottom: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		};
		const logoStyle = { margin: '2% 4%', cursor: 'pointer' };
		const quizletStyle = Object.assign({}, logoStyle, { width: '10%' });
		const aquaforcesStyle = Object.assign({}, logoStyle, { width: '15%' });
		const logoContainerStyle = {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		};
		const sources = this.props.searchSources;
		return (
			<div>
				<form onSubmit={(e) => { e.preventDefault(); this.search(); }} style={formStyle}>
					<TextInput
						placeholder="Search for question sets"
						ref={(t) => { this.input = t; }}
						width="100%"
						maxWidth="none"
						icon="/img/icons/search-nofocus.svg"
						focusedIcon="/img/icons/search-focus.svg"
						value={this.props.initialQuery || ''}
					/>
				</form>
				<div style={logoContainerStyle}>
					<img
						src={`/img/icons/quizlet-${sources.indexOf('quizlet') >= 0 ? '' : 'no'}selected.png`}
						alt="Quizlet" style={quizletStyle}
						onClick={() => { this.toggleSearchSource('quizlet'); }}
					/>
					<img
						src={`/img/logo/${sources.indexOf('aquaforces') >= 0 ? 'new-blue' : 'noselected'}.svg`}
						alt="Aquaforces" style={aquaforcesStyle}
						onClick={() => { this.toggleSearchSource('aquaforces'); }}
					/>
				</div>
			</div>
		);
	}
}

SearchBarDisplay.propTypes = {
	searchQuestionSets: PropTypes.func.isRequired,
	toggleSearchFilterSource: PropTypes.func.isRequired,
	searchSources: PropTypes.arrayOf(PropTypes.string).isRequired,
	initialQuery: PropTypes.string,
};

const mapStateToProps = (state) => ({
	searchSources: state.searchFilter.sources,
});

const mapDispatchToProps = { searchQuestionSets, toggleSearchFilterSource };
const SearchBar = connect(mapStateToProps, mapDispatchToProps)(SearchBarDisplay);

export default SearchBar;
