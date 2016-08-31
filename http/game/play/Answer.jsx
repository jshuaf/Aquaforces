import React, { Component, PropTypes } from 'react';
import autoBind from 'react-autobind';

class Answer extends Component {
	constructor(props) {
		super(props);
		const initialY = Math.random() * 100 - 100;
		const vx = (Math.random() - 0.5) / 300;
		const vy = (Math.random() - 0.5) / 150 + innerHeight / 15000;
		this.state = {
			position: {
				x: null,
				y: initialY,
			},
			velocity: {
				vx,
				vy,
			},
			disappeared: false,
			passedThreshold: false,
			shake: {
				angle: 0,
				time: null,
			},
		};
		this.answer = null;
		autoBind(this);
	}
	componentDidMount() {
		this.startAnimation();
	}
	setPosition() {
		const timeAtAnimation = Date.now();
		const dt = timeAtAnimation - this.state.lastAnimationTime;

		let positionX = this.state.position.x;
		let positionY = this.state.position.y;
		const velocityX = this.state.velocity.vx;
		let velocityY = this.state.velocity.vy;

		velocityY += dt * ((Math.random() - 0.5) / 10000);
		if ((velocityY) < 0.03) velocityY = +velocityY + 0.03;

		// check if it's already passed the threshold
		if (positionY > this.props.riverBounds.bottom) { return; }

		// increment
		positionX += (velocityX) * dt;
		positionY += (velocityY) * dt;

		// check if it's passing the threshold for the first time
		if (positionY > this.props.riverBounds.bottom - this.props.riverBounds.top) {
			this.setState({
				passedThreshold: true,
			});
		}

		this.setState({
			position: { x: positionX, y: positionY },
			velocity: { vx: velocityX, vy: velocityY },
			lastAnimationTime: timeAtAnimation,
		});
	}
	setAngle() {
		const currentTime = Date.now();
		const shakeTime = this.state.shake.time;
		const timeDifference = (currentTime - shakeTime) / 1000;
		if (shakeTime && timeDifference > 0 && timeDifference <= 0.6) {
			const scaledTime = timeDifference / (0.6 / 8);
			const shakeAngle = 30 * Math.sin(Math.PI * scaledTime / 2);
			this.setState({ shake: {
				angle: shakeAngle,
				time: shakeTime,
			} });
		} else {
			this.setState({ shake: {
				angle: 0,
				time: null,
			} });
		}
	}
	startAnimation() {
		const currentTime = Date.now();
		const initialX = this.props.generateAnswerPosition(this.answer.offsetWidth);
		this.setState((previousState) => (
			{
				startTime: currentTime,
				lastAnimationTime: currentTime,
				position: { x: initialX, y: previousState.position.y },
				offsetWidth: this.answer.offsetWidth,
			}), () => {
			const positionAnimation = this.animate(new Date());
			this.setState({ positionAnimation });
		});
	}
	disappear() {
		this.setState({
			disappeared: true,
		});
	}
	shake() {
		this.setState({ shake: {
			time: Date.now(),
			angle: 0,
		} });
	}
	animate() {
		if (this.props.keepRunning && !(this.state.passedThreshold)) {
			this.setPosition();
			this.setAngle();
			requestAnimationFrame(this.animate);
		} else {
			this.props.answerPassedThreshold(this.props.text);
		}
	}
	handleClick() {
		this.props.onClick(this.props.text);
	}
	render() {
		const x = this.state.position.x; const y = this.state.position.y;
		const style = {
			transform: `translate(${x}px, ${y}px) rotate(${this.state.shake.angle}deg)`,
		};
		if (!this.state.disappeared) {
			return (
				<span
					style={style} onClick={this.handleClick}
					ref={(a) => { this.answer = a; }} className="pill">{this.props.text}
				</span>
			);
		}
		return null;
	}
}

export default Answer;
