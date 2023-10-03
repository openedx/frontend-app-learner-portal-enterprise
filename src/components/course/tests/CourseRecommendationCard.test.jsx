import React from 'react';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL, TEST_ENTERPRISE_SLUG } from '../../search/tests/constants';
import CourseRecommendationCard, { COURSE_REC_EVENT_NAME, SAME_PART_EVENT_NAME } from '../CourseRecommendationCard';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

const TEST_UUID = '1234053423-4212-21323-45fdf';
const initialAppState = {
  enterpriseConfig: {
    slug: TEST_ENTERPRISE_SLUG,
    uuid: TEST_UUID,
  },
};

const CourseRecommendationCardWithContext = (props) => (
  <AppContext.Provider value={initialAppState}>
    <CourseRecommendationCard {...props} />
  </AppContext.Provider>
);

const TEST_COURSE_KEY = 'test-course-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'http://fake.image';
const TEST_OWNER = {
  name: 'Partner Name',
  logoImageUrl: TEST_IMAGE_URL,
};

const course = {
  key: TEST_COURSE_KEY,
  title: TEST_TITLE,
  cardImageUrl: { src: TEST_CARD_IMG_URL },
  owners: [TEST_OWNER],
};

describe('<CourseRecommendationCard />', () => {
  test('renders the correct data', () => {
    const { container } = renderWithRouter(
      <CourseRecommendationCardWithContext course={course} />,
    );
    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByAltText(TEST_OWNER.name)).toBeInTheDocument();

    expect(container.querySelector('p.partner')).toHaveTextContent(TEST_OWNER.name);
    expect(container.querySelector('.pgn__card-image-cap')).toHaveAttribute('src', TEST_CARD_IMG_URL);
  });

  test('sends segment event with correct data when clicked', async () => {
    const { container } = renderWithRouter(
      <CourseRecommendationCardWithContext course={course} />,
    );
    userEvent.click(container.querySelector('.pgn__card'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_UUID,
      COURSE_REC_EVENT_NAME,
      { courseKey: course.key },
    );
  });

  test('sends segment event when same partner recommendation clicked', async () => {
    const { container } = renderWithRouter(
      <CourseRecommendationCardWithContext course={course} isPartnerRecommendation />,
    );
    userEvent.click(container.querySelector('.pgn__card'));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_UUID,
      SAME_PART_EVENT_NAME,
      { courseKey: course.key },
    );
  });
});
