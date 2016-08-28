import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import NewSetForm from './NewSetForm.jsx';
import QuestionSetList from './QuestionSetList.jsx';
import { viewSetsList, viewSetCreator, viewSet } from './actions';

class QuestionConsoleDisplay extends Component {
	render() {
		switch (this.props.displayType) {
		case 'list':
			return (
				<div id="questionConsole">
					<QuestionSetList createLink={this.props.viewSetCreator} />
				</div>
			);
		case 'create':
			return (
				<div id="questionConsole">
					<NewSetForm />
				</div>
			);
		case 'set':
			return (
				<div id="questionConsole" />
				// not yet functioning
			);
		default:
			return (
				<div id="questionConsole" />
			);
		}
	}
}

QuestionConsoleDisplay.propTypes = {
	displayType: PropTypes.oneOf(['list', 'create', 'set']).isRequired,
	activeSet: PropTypes.number,
	viewSetsList: PropTypes.func.isRequired,
	viewSetCreator: PropTypes.func.isRequired,
	viewSet: PropTypes.func.isRequired,
};


const mapStateToProps = (state) => ({
	displayType: state.consoleState.displayType,
	activeSet: state.consoleState.activeSet,
});

const mapDispatchToProps = (dispatch) => ({
	viewSetsList: () => {
		dispatch(viewSetsList());
	},
	viewSetCreator: () => {
		dispatch(viewSetCreator());
	},
	viewSet: (setID) => {
		dispatch(viewSet(setID));
	},
});

const QuestionConsole = connect(mapStateToProps, mapDispatchToProps)(QuestionConsoleDisplay);

export default QuestionConsole;
