import { useMemo } from 'react';
import Color from 'color';

import { isDefinedAndNotNull, isDefined } from '../../../utils/common';

const COLOR_LIGHTEN_DARKEN_MODIFER = 0.2;
const COLOR_MIX_MODIFER = 0.1;

// eslint-disable-next-line import/prefer-default-export
export const useStylesForCustomBrandColors = (enterpriseConfig) => {
  const brandColors = useMemo(
    () => {
      if (isDefinedAndNotNull(enterpriseConfig)) {
        const { branding } = enterpriseConfig;

        const primaryColor = Color(branding.colors.primary);
        const secondaryColor = Color(branding.colors.secondary);
        const tertiaryColor = Color(branding.colors.tertiary);

        const whiteColor = Color('#ffffff');
        const darkColor = Color('#171c29');

        const getA11yTextColor = color => (color.isDark() ? whiteColor : darkColor);

        return {
          white: whiteColor,
          dark: darkColor,
          primary: {
            regular: primaryColor,
            light: primaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFER),
            dark: primaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFER),
            textColor: getA11yTextColor(primaryColor),
          },
          secondary: {
            regular: secondaryColor,
            light: secondaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFER),
            dark: secondaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFER),
            textColor: getA11yTextColor(secondaryColor),
          },
          tertiary: {
            regular: tertiaryColor,
            light: tertiaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFER),
            dark: tertiaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFER),
            textColor: getA11yTextColor(tertiaryColor),
          },
        };
      }
      return undefined;
    },
    [enterpriseConfig],
  );

  if (!isDefined(brandColors)) {
    return null;
  }

  const colors = ['primary', 'secondary', 'tertiary'];
  const styles = colors.map((colorName) => (
    `
      .brand-btn-${colorName} {
        background-color: ${brandColors[colorName].regular.hex()} !important;
        border-color: ${brandColors[colorName].regular.hex()} !important;
        color: ${brandColors[colorName].textColor.hex()} !important;
      }
      .brand-btn-${colorName}:hover {
        background-color: ${brandColors[colorName].dark.hex()} !important;
        border-color: ${brandColors[colorName].dark.hex()} !important;
      }
      .brand-btn-${colorName}:focus:before {
        border-color: ${brandColors[colorName].regular.hex()} !important;
      }

      .brand-btn-outline-${colorName} {
        border-color: ${brandColors[colorName].regular.hex()} !important;
        color: ${brandColors[colorName].regular.hex()} !important;
      }
      .brand-btn-outline-${colorName}:hover {
        border-color: ${brandColors[colorName].dark.hex()} !important;
        background-color: ${brandColors.white.mix(brandColors[colorName].light, COLOR_MIX_MODIFER).hex()} !important;
      }
      .brand-btn-outline-${colorName}:focus:before {
        border-color: ${brandColors[colorName].regular.hex()} !important;
      }

      .brand-bg-${colorName} {
        background-color: ${brandColors[colorName].regular.hex()} !important;
        color: ${brandColors[colorName].textColor.hex()} !important;
      }

      .brand-border-${colorName} {
        border-color: ${brandColors[colorName].regular.hex()} !important;
      }
    `
  ));

  return styles;
};
