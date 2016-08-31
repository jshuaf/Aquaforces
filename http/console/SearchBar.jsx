import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import TextInput from '../shared/TextInput.jsx';
import { populateQuestionSetList } from './actions';

const request = require('request');

/* global sweetAlert:true */

class SearchBarDisplay extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	search() {
		const query = this.input.node.value;
		const url = `${location.protocol}//${location.host}/api/search`;
		if (!query) return;
		console.log(query);
		request({
			url,
			body: { query },
			json: true,
			method: 'post',
		}, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
			this.props.populateQuestionSetList(res.body);
		});
	}
	render() {
		return (
				<TextInput
					placeholder="science"
					ref={(t) => { this.input = t; }}
					onChange={this.search}
				/>
		);
	}
}

SearchBarDisplay.propTypes = {
	populateQuestionSetList: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
	populateQuestionSetList: (sets) => {
		dispatch(populateQuestionSetList(sets));
	},
});

const SearchBar = connect(null, mapDispatchToProps)(SearchBarDisplay);

export default SearchBar;
