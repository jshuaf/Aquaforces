import React from 'react';
import { mount } from 'enzyme';
import { HeaderRaw } from '../../http/shared/Header.jsx';

describe('Header', () => {
	let wrapper;
	beforeEach(() => {
		if (!jest.isMockFunction(HeaderRaw.prototype.logIn)) {
			HeaderRaw.prototype.logIn = jest.fn();
		}
		if (!jest.isMockFunction(HeaderRaw.prototype.logOut)) {
			HeaderRaw.prototype.logOut = jest.fn();
		}
		wrapper = mount(<HeaderRaw />);
	});
	it('can log in', () => {
		wrapper.find('PrimaryButton').simulate('click');
		expect(HeaderRaw.prototype.logIn).toBeCalled();
	});
	it('can log out', () => {
		wrapper.setProps({ currentUser: { displayName: 'John' } });
		expect(wrapper.find(<span>Logged in as John</span>)).toBeTruthy();
		wrapper.find('div > div > a').simulate('click');
		expect(HeaderRaw.prototype.logOut).toBeCalled();
	});
});
