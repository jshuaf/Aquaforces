import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';
import TextInput from '../shared/TextInput.jsx';

const request = require('request');

/* global sweetAlert:true */

export default class SearchBar extends Component {
	constructor(props) {
		super(props);
		autoBind(this);
	}
	search() {
		const query = this.input.node.value;
		const url = `${location.protocol}//${location.host}/api/search`;
		request({
			url,
			body: { query },
			json: true,
			method: 'post',
		}, (error, res) => {
			if (error) return console.error(error);
			if (res.statusCode === 400) return sweetAlert(res.body, null, 'error');
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
