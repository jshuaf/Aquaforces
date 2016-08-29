import React from 'react';
import { shallow } from 'enzyme';
import PrimaryButton from '../../http/shared/PrimaryButton.jsx';

describe('PrimaryButton', () => {
	it('simulates click events', () => {
		const onClick = jest.fn();
		const wrapper = shallow(<PrimaryButton onClick={onClick} />);
		wrapper.find('button').simulate('click');
		expect(onClick).toBeCalled();
	});
});
