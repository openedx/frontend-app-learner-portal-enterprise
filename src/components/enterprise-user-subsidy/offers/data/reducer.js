import {
  FETCH_OFFERS_REQUEST,
  FETCH_OFFERS_SUCCESS,
  FETCH_OFFERS_FAILURE,
} from './constants';

export const initialOfferState = {
  loading: false,
  offers: [],
  offersCount: 0,
  error: null,
};

const offersReducer = (state = initialOfferState, action) => {
  switch (action.type) {
    case FETCH_OFFERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_OFFERS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        offers: action.payload.offers,
        offersCount: action.payload.offersCount,
      };
    case FETCH_OFFERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default offersReducer;
