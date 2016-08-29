import React from 'react';
import { shallow } from 'enzyme';
import PrimaryButton from '../../http/shared/PrimaryButton.jsx';

describe('PrimaryButton', () => {
	it('renders children passed in', () => {
		const wrapper = shallow(
			<PrimaryButton>
				<div className="hello">Hi</div>
			</PrimaryButton>
		);
		expect(wrapper.contains(<div className="hello">Hi</div>)).toBeTruthy();
	});
	it('simulates click events', () => {
		const onClick = jest.fn();
		const wrapper = shallow(<PrimaryButton onClick={onClick} />);
		wrapper.find('button').simulate('click');
		expect(onClick).toBeCalled();
	});
});
