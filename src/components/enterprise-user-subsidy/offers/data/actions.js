import { camelCaseObject } from '@edx/frontend-platform';

import {
  FETCH_OFFERS_REQUEST,
  FETCH_OFFERS_SUCCESS,
  FETCH_OFFERS_FAILURE,
} from './constants';
import * as service from './service';

const fetchOffersRequest = () => ({
  type: FETCH_OFFERS_REQUEST,
});

const fetchOffersSuccess = data => ({
  type: FETCH_OFFERS_SUCCESS,
  payload: {
    offers: data.results,
    offersCount: data.count,
  },
});

const fetchOffersFailure = error => ({
  type: FETCH_OFFERS_FAILURE,
  payload: {
    error,
  },
});

const fetchOffers = (queryOptions, dispatch) => {
  dispatch(fetchOffersRequest());

  return service.fetchOffers(queryOptions)
    .then((response) => {
      dispatch(fetchOffersSuccess(camelCaseObject(response.data)));
    })
    .catch((error) => {
      dispatch(fetchOffersFailure(error));
    });
};

// eslint-disable-next-line import/prefer-default-export
export { fetchOffers };
