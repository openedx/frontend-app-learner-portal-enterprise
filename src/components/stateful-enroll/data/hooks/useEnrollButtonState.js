import { useState } from 'react';

const useEnrollButtonState = (initialButtonState) => {
  const [buttonState, setButtonState] = useState(initialButtonState);

  const setEnrollButtonStatePending = () => {
    setButtonState('pending');
  };

  const setEnrollButtonStateComplete = () => {
    setButtonState('complete');
  };

  const setEnrollButtonStateError = () => {
    setButtonState('error');
  };

  return {
    buttonState,
    setEnrollButtonStatePending,
    setEnrollButtonStateComplete,
    setEnrollButtonStateError,
  };
};

export default useEnrollButtonState;
