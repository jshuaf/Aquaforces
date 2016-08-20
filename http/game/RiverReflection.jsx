const RiverReflection = React.createClass({
	getInitialState() {
		return {
			height: 80 + Math.random() * 20,
			yOffset: (2 + Math.random() * 3) * this.props.riverWidth / 100,
		};
	},

	render() {
		const style = {
			backgroundColor: this.props.backgroundColor,
			display: 'block',
			float: 'left',
			borderRadius: '10000000px',
			height: `${this.state.height}%`,
			transform: `translate(${this.props.xOffset}px, ${this.state.yOffset}px)`,
			width: `${this.props.width}%`,
		};
		return <div style={style}></div>;
	},

	// 2 - 4 groups on screen at a time
	// 2  - 3 in teach groups
	// more lighter than darker
	// make them offsetWidth
	// if 3, two should be at least the same
});
