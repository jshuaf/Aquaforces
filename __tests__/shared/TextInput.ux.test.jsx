import React from 'react';
import { shallow, mount } from 'enzyme';
import TextInput from '../../http/shared/TextInput.jsx';

describe('TextInput', () => {
	it('calls onComplete when its content is full', () => {
		const onComplete = jest.fn();
		const isComplete = text => text.length > 5;
		const wrapper = mount(<TextInput onComplete={onComplete} isComplete={isComplete} label="" />);
		wrapper.instance().node.value = 'Hello';
		wrapper.find('input').simulate('change', { target: { value: 'Hello' } });
		expect(onComplete).not.toBeCalled();
		wrapper.instance().node.value = 'Hello?';
		wrapper.find('input').simulate('change', { target: { value: 'Hello?' } });
		expect(onComplete).toBeCalled();
	});
});
