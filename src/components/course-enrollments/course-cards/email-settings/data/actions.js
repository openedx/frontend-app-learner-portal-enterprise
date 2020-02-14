import {
  UPDATE_EMAIL_SETTINGS_REQUEST,
  UPDATE_EMAIL_SETTINGS_SUCCESS,
  UPDATE_EMAIL_SETTINGS_FAILURE,
} from './constants';

import * as service from './service';

const updateEmailSettingsRequest = () => ({
  type: UPDATE_EMAIL_SETTINGS_REQUEST,
});

const updateEmailSettingsSuccess = data => ({
  type: UPDATE_EMAIL_SETTINGS_SUCCESS,
  payload: {
    data,
  },
});

const updateEmailSettingsFailure = error => ({
  type: UPDATE_EMAIL_SETTINGS_FAILURE,
  payload: {
    error,
  },
});

const updateEmailSettings = ({
  courseRunId,
  hasEmailsEnabled,
  onSuccess = () => {},
  onError = () => {},
}) => (
  async (dispatch) => {
    dispatch(updateEmailSettingsRequest());
    let response;
    try {
      response = await service.updateEmailSettings(courseRunId, hasEmailsEnabled);
      dispatch(updateEmailSettingsSuccess(response.data));
      onSuccess(hasEmailsEnabled);
    } catch (error) {
      dispatch(updateEmailSettingsFailure(error));
      onError(error);
    }
    return response;
  }
);

// eslint-disable-next-line import/prefer-default-export
export { updateEmailSettings };
