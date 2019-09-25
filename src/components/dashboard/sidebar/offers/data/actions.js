import { camelCaseObject } from '@edx/frontend-learner-portal-base/src/utils';

import {
  FETCH_OFFERS_REQUEST,
  FETCH_OFFERS_SUCCESS,
  FETCH_OFFERS_FAILURE,
} from './constants';
import * as service from './service';

const fetchOffersRequest = () => ({
  type: FETCH_OFFERS_REQUEST,
});

const fetchOffersSuccess = offers => ({
  type: FETCH_OFFERS_SUCCESS,
  payload: {
    offers,
  },
});

const fetchOffersFailure = error => ({
  type: FETCH_OFFERS_FAILURE,
  payload: {
    error,
  },
});

const fetchOffers = () => (
  (dispatch) => {
    dispatch(fetchOffersRequest());
    return service.fetchOffers()
      .then((response) => {
        dispatch(fetchOffersSuccess(camelCaseObject(response.data.results)));
      })
      .catch((error) => {
        dispatch(fetchOffersFailure(error));
      });
  }
);

// eslint-disable-next-line import/prefer-default-export
export { fetchOffers };
