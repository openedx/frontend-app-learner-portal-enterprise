import React, { useCallback, useState, useEffect } from 'react';

// eslint-disable-next-line import/prefer-default-export
export const useWindowSize = () => {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }
    const handleResize = () => {
      setWindowSize(getSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export function useRenderContactHelpText(enterpriseConfig) {
  const renderContactHelpText = useCallback(
    () => {
      const { contactEmail } = enterpriseConfig;
      const message = 'reach out to your organization\'s edX administrator';
      if (contactEmail) {
        return (
          <a className="text-underline" href={`mailto:${contactEmail}`}>
            {message}
          </a>
        );
      }
      return message;
    },
    [enterpriseConfig],
  );

  return renderContactHelpText;
}
