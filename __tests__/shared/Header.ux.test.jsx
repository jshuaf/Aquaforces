import React from 'react';
import { shallow } from 'enzyme';
import { Header } from '../../http/shared/Header.jsx';

describe('Header', () => {
	it('can log in', () => {
		const wrapper = shallow(<Header />);
		wrapper.find('PrimaryButton').simulate('click');
	});
});
