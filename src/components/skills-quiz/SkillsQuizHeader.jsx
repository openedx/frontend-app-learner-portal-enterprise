import React from 'react';
import edxLogo from './images/edx-logo.svg';

function SkillsQuizHeader() {
  return (
    <div style={{ display: 'flex' }} className="ml-2">
      <img src={edxLogo} alt="edx-logo" height="110px" />
      <div
        className="ml-5 vertical-line"
      />
      <div style={{ minWidth: 'max-content' }} className="ml-5 header-text">
        <h1 className="heading">Skills Builder</h1>
        <h2 className="subheading">
          Start your learning journey with edX
        </h2>
      </div>
    </div>
  );
}

export default SkillsQuizHeader;
