import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  FETCH_OFFERS_REQUEST,
  FETCH_OFFERS_SUCCESS,
  FETCH_OFFERS_FAILURE,
} from '../constants';
import {
  fetchOffers,
} from '../actions';
import * as service from '../service';

const mockStore = configureMockStore([thunk]);
jest.mock('../service');

describe('fetchOffers action', () => {
  it('fetch offers success', () => {
    const expectedAction = [
      { type: FETCH_OFFERS_REQUEST },
      {
        type: FETCH_OFFERS_SUCCESS,
        payload: {
          offers: [{ fooBar: 'foo' }],
        },
      },
    ];
    const store = mockStore();


    service.fetchOffers.mockImplementation((
      () => Promise.resolve({ data: { results: [{ foo_bar: 'foo' }] } })
    ));

    return store.dispatch(fetchOffers())
      .then(() => expect(store.getActions()).toEqual(expectedAction));
  });

  it('fetch offers failure', () => {
    const expectedAction = [
      { type: FETCH_OFFERS_REQUEST },
      {
        type: FETCH_OFFERS_FAILURE,
        payload: {
          error: Error,
        },
      },
    ];
    const store = mockStore();

    service.fetchOffers.mockImplementation((
      () => Promise.reject(Error)
    ));

    return store.dispatch(fetchOffers())
      .then(() => expect(store.getActions()).toEqual(expectedAction));
  });
});
