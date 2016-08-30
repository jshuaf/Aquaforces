import React from 'react';
import renderer from 'react-test-renderer';
import TextInput from '../../http/shared/TextInput.jsx';

describe('TextInput', () => {
	it('passes down its props', () => {
		const component = renderer.create(
			<TextInput placeholder="bobby" label="name" color="blue" backgroundColor="red" />
		);
		const tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

