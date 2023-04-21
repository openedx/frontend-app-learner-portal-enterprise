import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import BasicNavigateToCourseware from './BasicNavigateToCourseware';

const MOCK_COURSE_RUN_URL = 'https://edx.org';

const BasicNavigateToCoursewareWrapper = (props) => (
  <IntlProvider locale="en">
    <BasicNavigateToCourseware
      courseRunUrl={MOCK_COURSE_RUN_URL}
      {...props}
    />
  </IntlProvider>
);

describe('BasicNavigateToCourseware', () => {
  it('should render', () => {
    render(<BasicNavigateToCoursewareWrapper />);
    const viewCourseCTA = screen.getByText('View course');
    expect(viewCourseCTA).toBeInTheDocument();
    const href = viewCourseCTA.closest('a').getAttribute('href');
    expect(href).toEqual(MOCK_COURSE_RUN_URL);
  });
});
