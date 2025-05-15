import { useEffect, useRef } from 'react';
import useStylesForCustomBrandColors from './useStylesForCustomBrandColors';
import { useEnterpriseCustomer } from '../../../app/data';

/**
 * Custom hook to manage the injection of brand styles into the document head.
 * This hook directly manipulates the DOM to inject and update style elements
 * based on the enterprise customer's brand colors.
 */
const useBrandStylesInjection = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const brandStyles = useStylesForCustomBrandColors(enterpriseCustomer);
  const stylesRef = useRef<Record<string, HTMLStyleElement>>({});

  useEffect(() => {
    // Skip if no brand styles are available
    if (!brandStyles) {
      // Remove any existing styles
      Object.values(stylesRef.current).forEach((styleEl) => {
        if (document.head.contains(styleEl)) {
          document.head.removeChild(styleEl);
        }
      });
      stylesRef.current = {};
      return undefined;
    }

    // Add or update style elements for each brand style
    brandStyles.forEach(({ key, styles }) => {
      const existingStyleEl = stylesRef.current[key];

      if (existingStyleEl) {
        // Update existing style if content changed
        if (existingStyleEl.textContent !== styles) {
          existingStyleEl.textContent = styles;
        }
      } else {
        // Create and inject a new style element
        const styleEl = document.createElement('style');
        styleEl.setAttribute('type', 'text/css');
        styleEl.setAttribute('data-brand-style', key);
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        // Store reference
        stylesRef.current[key] = styleEl;
      }
    });

    // Cleanup function
    return () => {
      Object.values(stylesRef.current).forEach((styleEl) => {
        if (document.head.contains(styleEl)) {
          document.head.removeChild(styleEl);
        }
      });
      stylesRef.current = {};
    };
  }, [brandStyles]);
};

export default useBrandStylesInjection;
