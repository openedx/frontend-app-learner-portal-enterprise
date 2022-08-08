import { GEAG_TERMS } from './constants';

export function getExecutiveEducation2UTerms() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: GEAG_TERMS });
    }, 2000);
  });
}
