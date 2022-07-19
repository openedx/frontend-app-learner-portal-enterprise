import { useRef, useEffect } from 'react';

// eslint-disable-next-line import/prefer-default-export
export const useIsFirstRender = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};
