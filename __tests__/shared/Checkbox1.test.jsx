import React from 'react';
import { shallow } from 'enzyme';
import Checkbox from '../../http/shared/Checkbox.jsx';

describe('Checkbox', () => {
	it('can tell when it\'s changed', () => {
		const onChange = jest.fn();
		const wrapper = shallow(<Checkbox onChange={onChange} />);
		console.log(wrapper);
		wrapper.find('input').simulate('change');
		expect(onChange).toBeCalled();
	});
});
