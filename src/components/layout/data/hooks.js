import { useMemo } from 'react';
import Color from 'color';

import { isDefinedAndNotNull, isDefined, getBrandColorsFromCSSVariables } from '../../../utils/common';

const COLOR_LIGHTEN_DARKEN_MODIFIER = 0.2;

export const useStylesForCustomBrandColors = (enterpriseCustomer) => {
  const enterpriseBrandColors = useMemo(
    () => {
      if (!isDefinedAndNotNull(enterpriseCustomer)) {
        return undefined;
      }

      const brandColors = getBrandColorsFromCSSVariables();

      const { brandingConfiguration } = enterpriseCustomer;
      const primaryColor = Color(brandingConfiguration.primaryColor);
      const secondaryColor = Color(brandingConfiguration.secondaryColor);
      const tertiaryColor = Color(brandingConfiguration.tertiaryColor);
      const whiteColor = Color(brandColors.white);
      const darkColor = Color(brandColors.dark);
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
    [enterpriseCustomer],
  );

  if (!isDefined(enterpriseBrandColors)) {
    return null;
  }

  const enterpriseColors = ['primary', 'secondary', 'tertiary'];
  const styles = enterpriseColors.map((colorName) => ({
    key: colorName,
    styles: (`
      .btn-brand-${colorName} {
        background-color: ${enterpriseBrandColors[colorName].regular.hex()} !important;
        border-color: ${enterpriseBrandColors[colorName].regular.hex()} !important;
        color: ${enterpriseBrandColors[colorName].textColor.hex()} !important;
      }
      .btn-brand-${colorName}:hover {
        background-color: ${enterpriseBrandColors[colorName].dark.hex()} !important;
        border-color: ${enterpriseBrandColors[colorName].dark.hex()} !important;
      }
      .btn-brand-${colorName}:focus:before {
        border-color: ${enterpriseBrandColors[colorName].regular.hex()} !important;
      }
      .bg-brand-${colorName} {
        background-color: ${enterpriseBrandColors[colorName].regular.hex()} !important;
      }
      .border-brand-${colorName} {
        border-color: ${enterpriseBrandColors[colorName].regular.hex()} !important;
      }
      .color-brand-${colorName} {
        color: ${enterpriseBrandColors[colorName].regular.hex()} !important;
      }
      .text-brand-${colorName} {
        color: ${enterpriseBrandColors[colorName].textColor.hex()} !important;
      }
    `),
  }));

  styles.push({
    key: 'general',
    styles: (`
      .btn-primary {
        background-color: ${enterpriseBrandColors.primary.regular.hex()} !important;
        border-color: ${enterpriseBrandColors.primary.regular.hex()} !important;
        color: ${enterpriseBrandColors.primary.textColor.hex()} !important;
      }
      .btn-primary:hover {
        background-color: ${enterpriseBrandColors.primary.dark.hex()} !important;
        border-color: ${enterpriseBrandColors.primary.dark.hex()} !important;
      }
      .btn-primary:focus:before {
        border-color: ${enterpriseBrandColors.primary.regular.hex()} !important;
      }
      .btn-brand {
        background-color: ${enterpriseBrandColors.primary.regular.hex()} !important;
        border-color: ${enterpriseBrandColors.primary.regular.hex()} !important;
        color: ${enterpriseBrandColors.primary.textColor.hex()} !important;
      }
      .btn-brand:hover {
        background-color: ${enterpriseBrandColors.primary.dark.hex()} !important;
        border-color: ${enterpriseBrandColors.primary.dark.hex()} !important;
      }
      .btn-brand:focus:before {
        border-color: ${enterpriseBrandColors.primary.regular.hex()} !important;
      }
    `),
  });

  return styles;
};
