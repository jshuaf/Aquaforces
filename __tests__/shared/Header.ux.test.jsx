import React from 'react';
import { shallow } from 'enzyme';
import { HeaderRaw } from '../../http/shared/Header.jsx';

describe('Header', () => {
	it('can log in', () => {
		HeaderRaw.prototype.logIn = jest.fn();
		const wrapper = shallow(<HeaderRaw />);
		wrapper.find('PrimaryButton').simulate('click');
		expect(HeaderRaw.prototype.logIn).toBeCalled();
	});
});
