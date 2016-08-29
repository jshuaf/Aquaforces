import React from 'react';
import renderer from 'react-test-renderer';
import PrimaryButton from '../../http/shared/PrimaryButton.jsx';

describe('PrimaryButton', () => {
	it('changes the color when hovered', () => {
		const component = renderer.create(
			<PrimaryButton>Click me</PrimaryButton>
		);
		let tree = component.toJSON();
		expect(tree).toMatchSnapshot();

		tree.props.onMouseEnter();
		tree = component.toJSON();
		expect(tree).toMatchSnapshot();

		tree.props.onMouseLeave();
		tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
