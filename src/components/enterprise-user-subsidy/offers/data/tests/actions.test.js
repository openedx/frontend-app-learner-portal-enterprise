import {
  FETCH_OFFERS_REQUEST,
  FETCH_OFFERS_SUCCESS,
  FETCH_OFFERS_FAILURE,
} from '../constants';
import {
  fetchOffers,
} from '../actions';
import * as service from '../service';

jest.mock('../service');

describe('fetchOffers action', () => {
  it('fetch offers success', () => {
    const expectedAction = [
      { type: FETCH_OFFERS_REQUEST },
      {
        type: FETCH_OFFERS_SUCCESS,
        payload: {
          offers: [{ fooBar: 'foo', redemptionsRemaining: 2 }],
          offersCount: 2,
        },
      },
    ];

    service.fetchOffers.mockImplementation((
      () => Promise.resolve({ data: { results: [{ foo_bar: 'foo', redemptions_remaining: 2 }], count: 2 } })
    ));
    const dispatchSpy = jest.fn();
    return fetchOffers(null, dispatchSpy)
      .then(() => {
        expect(dispatchSpy).toHaveBeenNthCalledWith(1, expectedAction[0]);
        expect(dispatchSpy).toHaveBeenNthCalledWith(2, expectedAction[1]);
      });
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

    service.fetchOffers.mockImplementation((
      () => Promise.reject(Error)
    ));
    const dispatchSpy = jest.fn();
    return fetchOffers(null, dispatchSpy)
      .then(() => {
        expect(dispatchSpy).toHaveBeenNthCalledWith(1, expectedAction[0]);
        expect(dispatchSpy).toHaveBeenNthCalledWith(2, expectedAction[1]);
      });
  });
});
