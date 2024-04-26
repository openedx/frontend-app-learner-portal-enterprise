import { Container } from '@openedx/paragon';
import React from 'react';

const PathwaysSection = () => (
  <Container className="pathway-section mb-4">
    <Container size="lg" className="inner-container pr-0">
      <div className="row">
        <div className="col">
          <p className="eyebrow">Pathway</p>
          <h1 className="pathway-title">Ai for Leaders</h1>
          <p className="pathway-description">Lead with AI. This pathway will introduce you to basics of AI, as well as cover core
            concepts for how to use and apply AI responsibly to support the strategy and growth
            of your business.
          </p>
        </div>
        <div className="col d-flex justify-content-center align-items-center">
          <button className="launch-btn" type="button">Launch Pathway</button>
        </div>
      </div>
    </Container>
  </Container>
);

export default PathwaysSection;
