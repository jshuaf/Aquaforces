import React from 'react';
import { mount } from 'enzyme';
import TextInput from '../../http/shared/TextInput.jsx';

describe('TextInput', () => {
	it('calls onComplete when its content is full', () => {
		const onComplete = jest.fn();
		const isComplete = text => text.length > 5;
		const wrapper = mount(<TextInput onComplete={onComplete} isComplete={isComplete} />);
		wrapper.find('input').simulate('change', { target: { value: 'Hello' } });
		expect(onComplete).not.toBeCalled();
		wrapper.find('input').simulate('change', { target: { value: 'Hello?' } });
		expect(onComplete).toBeCalled();
	});
});
