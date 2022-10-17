import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { breakpoints } from '@edx/paragon';

import {
  RECOMMENDED_COURSES_SUBTITLE,
  RECOMMENDED_COURSES_TITLE,
} from '../constants';
import {
  renderWithRouter,
} from '../../../utils/tests';
import RecommendationsCarousel from '../RecommendationsCarousel';
import RecommendedCourseCard from '../RecommendedCourseCard';

const RECOMMENDED_COURSES = [
  {
    courseKey: 'HarvardX+CS50x',
    title: 'CS50\'s Introduction to Computer Science',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-3b9fb73b5d5d.small.jpg',
    marketingUrl: 'course/HarvardX+CS50x',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
    partners: [
      {
        name: 'Harvard University',
      },
    ],
  },
  {
    courseKey: 'HarvardX+CS50W',
    title: 'CS50\'s Web Programming with Python and JavaScript',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/8f8e5124-1dab-47e6-8fa6-3fbdc0738f0a-762af069070e.small.jpg',
    marketingUrl: 'course/HarvardX+CS50W',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
    partners: [
      {
        name: 'Harvard University',
      },
    ],
  },
  {
    courseKey: 'UQx+IELTSx',
    title: 'IELTS Academic Test Preparation',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/d61d7a1f-3333-4169-a786-92e2bf690c6f-fa8a6909baec.small.jpg',
    marketingUrl: 'course/UQx+IELTSx',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/8554749f-b920-4d7f-8986-af6bb95290aa-f336c6a2ca11.png',
    partners: [
      {
        name: 'The University of Queensland',
      },
    ],
  },
  {
    courseKey: 'ETSx+TOEFLx',
    title: 'TOEFL® Test Preparation: The Insider’s Guide',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/ee4f4f12-e6ec-45ac-94df-b90b4b022903-aaf6257f767b.small.jpeg',
    marketingUrl: 'course/ETSx+TOEFLx',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/9d9e1a30-c34d-4ad1-8c5a-d2410db8c123-8beea336c2a4.png',
    partners: [
      {
        name: 'Educational Testing Service',
      },
    ],
  },
  {
    courseKey: 'HarvardX+PH125.1x',
    title: 'Data Science: R Basics',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/91f52ef3-fa3f-4934-9d19-8d5a32635cd4-d99e27f09d19.small.jpg',
    marketingUrl: 'course/HarvardX+PH125.1x',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
    partners: [
      {
        name: 'Harvard University',
      },
    ],
  },
];

const largeScreenWindowConfig = {
  type: 'screen',
  width: breakpoints.large.minWidth + 1,
  height: 800,
};
const mediumScreenWindowConfig = {
  type: 'screen',
  width: breakpoints.medium.maxWidth - 1,
  height: 800,
};
const smallScreenWindowConfig = {
  type: 'screen',
  width: breakpoints.small.maxWidth - 1,
  height: 800,
};

let props = {};

HTMLCanvasElement.prototype.getContext = jest.fn();

describe('<RecommendationsCarousel />', () => {
  beforeEach(() => {
    props = {
      carouselItem: RecommendedCourseCard,
      carouselData: RECOMMENDED_COURSES,
      carouselTitle: RECOMMENDED_COURSES_TITLE,
      carouselSubtitle: RECOMMENDED_COURSES_SUBTITLE,
    };
  });

  test('renders course recommendations', () => {
    window.matchMedia.setConfig(largeScreenWindowConfig);

    const recommendedCourses = renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );
    const courses = recommendedCourses.container.getElementsByClassName('ais-Hits-item');

    expect(courses.length).toEqual(props.carouselData.length);
    expect(screen.queryByText(RECOMMENDED_COURSES_TITLE)).toBeInTheDocument();
  });

  test('renders nothing if no recommended courses', () => {
    props = {
      ...props,
      carouselData: [],
    };
    const recommendedCourses = renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );
    const courses = recommendedCourses.container.getElementsByClassName('ais-Hits-item');

    expect(courses.length).toEqual(0);
    expect(screen.queryByText(RECOMMENDED_COURSES_TITLE)).toBeNull();
  });

  test('renders loading state when isLoading is true', () => {
    props = {
      ...props,
      carouselData: undefined,
    };
    const recommendedCourses = renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );
    const titleLoading = recommendedCourses.container.getElementsByClassName('react-loading-skeleton');

    expect(titleLoading.length).toBeGreaterThan(1);
  });

  test('renders arrow icons for more than 4 courses on large screen', () => {
    window.matchMedia.setConfig(largeScreenWindowConfig);

    const recommendedCourses = renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );

    const arrows = recommendedCourses.container.getElementsByClassName('carousal-arrow-control');

    expect(arrows.length).toEqual(2);
  });

  test('does not render arrow icons for less than 5 courses on large screen', () => {
    window.matchMedia.setConfig(largeScreenWindowConfig);

    props = {
      ...props,
      carouselData: props.carouselData.slice(0, 3),
    };
    const recommendedCourses = renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );

    const arrows = recommendedCourses.container.getElementsByClassName('carousal-arrow-control');

    expect(arrows.length).toEqual(0);
  });

  test('does not render arrow icons on medium and small screen', () => {
    window.matchMedia.setConfig(mediumScreenWindowConfig);

    const recommendedCourses = renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );

    const arrows = recommendedCourses.container.getElementsByClassName('carousal-arrow-control');

    expect(arrows.length).toEqual(0);
  });

  test('should move carousel right on right arrow click when enabled', () => {
    window.matchMedia.setConfig(largeScreenWindowConfig);

    renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );

    const coursesCarousel = screen.queryByTestId('courses-carousel');
    const rightArrow = screen.getByLabelText('Right');
    userEvent.click(rightArrow);

    expect(coursesCarousel).toHaveStyle('transform: translateX(-25%)');
  });

  test('should move carousel left on left arrow click when enabled', () => {
    window.matchMedia.setConfig(largeScreenWindowConfig);

    renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );

    const coursesCarousel = screen.queryByTestId('courses-carousel');
    const rightArrow = screen.getByLabelText('Right');
    const leftArrow = screen.getByLabelText('Left');

    // enabling left arrow since left arrow is disabled at start
    userEvent.click(rightArrow);
    userEvent.click(leftArrow);

    expect(coursesCarousel).toHaveStyle('transform: translateX(-0%)');
  });

  test('test left arrow disabled at the left endpoint of carousel', () => {
    window.matchMedia.setConfig(largeScreenWindowConfig);

    renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );

    const leftArrow = screen.getByLabelText('Left');

    expect(leftArrow).toHaveAttribute('disabled');
  });

  test('test right arrow disabled at the right endpoint of carousel', () => {
    window.matchMedia.setConfig(largeScreenWindowConfig);

    renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );

    const rightArrow = screen.getByLabelText('Right');

    // disabling right arrow since we are passing 5 courses, so it will be disabled after one click
    userEvent.click(rightArrow);

    expect(rightArrow).toHaveAttribute('disabled');
  });

  test('test carousel becomes scrollable on medium and small screen', () => {
    window.matchMedia.setConfig(mediumScreenWindowConfig);

    const recommendedCourses = renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );
    const coursesCarouselScroll = recommendedCourses.container.getElementsByClassName('overflow-auto');

    expect(coursesCarouselScroll.length).toEqual(1);
  });

  test('test scrollable small screen follows existing grid for 1 course', () => {
    window.matchMedia.setConfig(smallScreenWindowConfig);

    props = {
      ...props,
      carouselData: props.carouselData.slice(0, 1),
    };
    const recommendedCourses = renderWithRouter(
      <RecommendationsCarousel {...props} />,
    );
    const classes = recommendedCourses.container.getElementsByClassName('pl-0 pr-0');

    expect(classes.length).toEqual(1);
  });
});
