import React from 'react';
import { mount } from 'enzyme';
import { Header } from '../../http/shared/Header.jsx';

describe('Header', () => {
	it('can log in', () => {
		const wrapper = mount(<Header />);
		wrapper.logIn = jest.genMockFunction();
		wrapper.find('button').simulate('click');
		console.log(wrapper.debug());
		wrapper.logIn();
		console.log(wrapper.logIn);
		expect(wrapper.logIn).toBeCalled();
	});
});
