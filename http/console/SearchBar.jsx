import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import TextInput from '../shared/TextInput.jsx';
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
	render() {
		return (
				<form onSubmit={(e) => { e.preventDefault(); this.search(); }}>
					<TextInput
						placeholder="science"
						label="Search for sets"
						ref={(t) => { this.input = t; }}
					/>
				</form>
		);
	}
}

SearchBarDisplay.propTypes = {
	searchQuestionSets: PropTypes.func.isRequired,
};

const mapDispatchToProps = { searchQuestionSets };

const SearchBar = connect(null, mapDispatchToProps)(SearchBarDisplay);

export default SearchBar;
