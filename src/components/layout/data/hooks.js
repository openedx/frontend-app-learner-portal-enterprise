import { useMemo } from 'react';
import Color from 'color';

import { isDefinedAndNotNull, isDefined } from '../../../utils/common';

const COLOR_LIGHTEN_DARKEN_MODIFIER = 0.2;

export const useStylesForCustomBrandColors = (enterpriseConfig) => {
  const brandColors = useMemo(
    () => {
      if (!isDefinedAndNotNull(enterpriseConfig)) {
        return undefined;
      }

      // TODO: Co-locate this and its sister variable in a single location ./enterprise-page/data/hooks
      const colors = {
        white: getComputedStyle(document.documentElement).getPropertyValue('--pgn-color-white'),
        dark: getComputedStyle(document.documentElement).getPropertyValue('--pgn-color-dark'),
      };

      const { brandingConfiguration } = enterpriseConfig;
      const primaryColor = Color(brandingConfiguration.primaryColor);
      const secondaryColor = Color(brandingConfiguration.secondaryColor);
      const tertiaryColor = Color(brandingConfiguration.tertiaryColor);
      const whiteColor = Color(colors.white);
      const darkColor = Color(colors.dark);
      const getA11yTextColor = color => (color.isDark() ? whiteColor : darkColor);

      return {
        white: whiteColor,
        dark: darkColor,
        primary: {
          regular: primaryColor,
          light: primaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFIER),
          dark: primaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFIER),
          textColor: getA11yTextColor(primaryColor),
        },
        secondary: {
          regular: secondaryColor,
          light: secondaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFIER),
          dark: secondaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFIER),
          textColor: getA11yTextColor(secondaryColor),
        },
        tertiary: {
          regular: tertiaryColor,
          light: tertiaryColor.lighten(COLOR_LIGHTEN_DARKEN_MODIFIER),
          dark: tertiaryColor.darken(COLOR_LIGHTEN_DARKEN_MODIFIER),
          textColor: getA11yTextColor(tertiaryColor),
        },
      };
    },
    [enterpriseConfig],
  );

  if (!isDefined(brandColors)) {
    return null;
  }

  const enterpriseColors = ['primary', 'secondary', 'tertiary'];
  const styles = enterpriseColors.map((colorName) => ({
    key: colorName,
    styles: (`
      .btn-brand-${colorName} {
        background-color: ${brandColors[colorName].regular.hex()} !important;
        border-color: ${brandColors[colorName].regular.hex()} !important;
        color: ${brandColors[colorName].textColor.hex()} !important;
      }
      .btn-brand-${colorName}:hover {
        background-color: ${brandColors[colorName].dark.hex()} !important;
        border-color: ${brandColors[colorName].dark.hex()} !important;
      }
      .btn-brand-${colorName}:focus:before {
        border-color: ${brandColors[colorName].regular.hex()} !important;
      }
      .bg-brand-${colorName} {
        background-color: ${brandColors[colorName].regular.hex()} !important;
      }
      .border-brand-${colorName} {
        border-color: ${brandColors[colorName].regular.hex()} !important;
      }
      .color-brand-${colorName} {
        color: ${brandColors[colorName].regular.hex()} !important;
      }
      .text-brand-${colorName} {
        color: ${brandColors[colorName].textColor.hex()} !important;
      }
    `),
  }));

  styles.push({
    key: 'general',
    styles: (`
      .btn-primary {
        background-color: ${brandColors.primary.regular.hex()} !important;
        border-color: ${brandColors.primary.regular.hex()} !important;
        color: ${brandColors.primary.textColor.hex()} !important;
      }
      .btn-primary:hover {
        background-color: ${brandColors.primary.dark.hex()} !important;
        border-color: ${brandColors.primary.dark.hex()} !important;
      }
      .btn-primary:focus:before {
        border-color: ${brandColors.primary.regular.hex()} !important;
      }
      .btn-brand {
        background-color: ${brandColors.primary.regular.hex()} !important;
        border-color: ${brandColors.primary.regular.hex()} !important;
        color: ${brandColors.primary.textColor.hex()} !important;
      }
      .btn-brand:hover {
        background-color: ${brandColors.primary.dark.hex()} !important;
        border-color: ${brandColors.primary.dark.hex()} !important;
      }
      .btn-brand:focus:before {
        border-color: ${brandColors.primary.regular.hex()} !important;
      }
    `),
  });

  return styles;
};
