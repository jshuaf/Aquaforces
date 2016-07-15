const RiverReflection = React.createClass({
	render() {
		const width = 10 + Math.random() * 15;
		const style = {
			backgroundColor: this.props.backgroundColor,
			borderRadius: '50%',
			transform: `translate($(this.props.x) px, $(this.props.y) px)`,
			width: `$(width) rem`,
			height: '3rem'
		};
		return <div style={style}></div>;
	}

	// 2 - 4 groups on screen at a time
	// 2  - 3 in teach groups
	// more lighter than darker
	// make them offsetWidth
	// if 3, two should be at least the same
});

const RiverShore = React.createClass({
	render() {
		return null;
	}

	// 2 groups in each screen
	// 1 - 2 in each group
});