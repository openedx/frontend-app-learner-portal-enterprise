import React from 'react';

import Course from './Course';
import AuthenticatedPage from '../app/AuthenticatedPage';

export default function CoursePage() {
  return (
    <AuthenticatedPage>
      <Course />
    </AuthenticatedPage>
  );
}
