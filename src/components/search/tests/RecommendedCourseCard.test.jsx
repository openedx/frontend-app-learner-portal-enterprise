import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  renderWithRouter,
} from '../../../utils/tests';
import RecommendedCourseCard from '../RecommendedCourseCard';

const props = {
  itemData: {
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
  isLoading: false,
  classes: '',
};

const propsLoading = {
  itemData: {},
  isLoading: true,
  classes: '',
};
HTMLCanvasElement.prototype.getContext = jest.fn();

describe('<RecommendedCourseCard />', () => {
  test('renders course card if isLoading is false', () => {
    renderWithRouter(
      <RecommendedCourseCard {...props} />,
    );

    expect(screen.queryByText(props.itemData.title)).toBeInTheDocument();
  });

  test('renders loading state if isLoading is true', () => {
    renderWithRouter(
      <RecommendedCourseCard {...propsLoading} />,
    );

    expect(screen.queryByTestId('loading-carousel-item')).toBeInTheDocument();
  });
});
