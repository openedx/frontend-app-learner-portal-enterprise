import React from 'react';
import { Helmet } from 'react-helmet';

const NotFoundPage = () => (
  <div className="container-fluid mt-3">
    <Helmet title="Page Not Found" />
    <div className="text-center py-5">
      <h1>404</h1>
      <p className="lead">Oops, sorry we can&apos;t find that page!</p>
      <p>Either something went wrong or the page doesn&apos;t exist anymore.</p>
    </div>
  </div>
);

export default NotFoundPage;
