/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import matchMediaMock from 'match-media-mock';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

process.env.LMS_BASE_URL = 'http://localhost:18000';
process.env.MARKETING_SITE_BASE_URL = 'http://marketing.url';

// testing utility to mock window width, etc.
global.window.matchMedia = matchMediaMock.create();
