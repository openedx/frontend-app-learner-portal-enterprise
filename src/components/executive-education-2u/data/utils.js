export const toISOStringWithoutMilliseconds = (isoString) => {
  if (isoString.indexOf('.') === -1) {
    return isoString;
  }
  return `${isoString.split('.')[0]}Z`;
};

export const isDuplicateExternalCourseOrder = (formSubmissionError) => formSubmissionError?.message?.includes('duplicate order');
