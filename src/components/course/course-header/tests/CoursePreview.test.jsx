import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoursePreview from '../CoursePreview';
import { renderWithRouter } from '../../../../utils/tests';

const imageURL = 'https://test-domain.com/test-image/id.png';
const hlsUrl = 'https://test-domain.com/test-prefix/id.m3u8';
const ytUrl = 'https://www.youtube.com/watch?v=oHg5SJYRHA0';

describe('Course Preview Tests', () => {
  it('Renders preview image and not the video when video URL is not given.', () => {
    const { container, getByAltText } = renderWithRouter(<CoursePreview previewImage={imageURL} />);
    expect(container.querySelector('.course-preview-wrapper')).toBeTruthy();
    expect(container.querySelector('.video-component')).toBeFalsy();

    expect(getByAltText('course preview')).toBeInTheDocument();
  });

  it('Renders preview image and not the video when video URL is an empty string.', () => {
    const { container, getByAltText } = renderWithRouter(<CoursePreview previewImage={imageURL} previewVideoURL="" />);
    expect(container.querySelector('.course-preview-wrapper')).toBeTruthy();
    expect(container.querySelector('.video-component')).toBeFalsy();

    expect(getByAltText('course preview')).toBeInTheDocument();
  });

  it('Renders video preview when correct video URL is provided.', () => {
    const { container } = renderWithRouter(
      <CoursePreview previewImage={imageURL} previewVideoURL={hlsUrl} />,
    );
    expect(container.querySelector('.course-preview-wrapper')).toBeTruthy();
    expect(container.querySelector('.video-component')).toBeTruthy();

    expect(screen.queryByText('course preview')).not.toBeInTheDocument();
  });

  it('Renders video preview for youtube videos.', () => {
    const { container } = renderWithRouter(
      <CoursePreview previewImage={imageURL} previewVideoURL={ytUrl} />,
    );
    expect(container.querySelector('.course-preview-wrapper')).toBeTruthy();
    expect(container.querySelector('.video-component')).toBeTruthy();

    expect(screen.queryByText('course preview')).not.toBeInTheDocument();
  });

  it('Renders video play button and starts playing when user clicks on play.', async () => {
    const { container } = renderWithRouter(
      <CoursePreview previewImage={imageURL} previewVideoURL={ytUrl} />,
    );
    expect(container.querySelector('.course-preview-wrapper')).toBeTruthy();
    expect(container.querySelector('.video-component')).toBeTruthy();
    expect(container.querySelector('.video-trigger')).toBeTruthy();
    expect(container.querySelector('.video-wrapper')).toBeFalsy();
    expect(container.querySelector('video-js')).toBeFalsy();

    // Start video play
    expect(screen.queryByText('Play Video')).toBeInTheDocument();
    userEvent.click(screen.getByText('Play Video'));

    expect(container.querySelector('.video-trigger')).toBeFalsy();
    expect(container.querySelector('.video-wrapper')).toBeTruthy();

    await waitFor(() => {
      expect(container.querySelector('video-js')).toBeTruthy();
    });
  });
});
