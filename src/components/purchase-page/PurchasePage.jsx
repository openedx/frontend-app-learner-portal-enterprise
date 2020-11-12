import React from 'react';
import { Helmet } from 'react-helmet';

import PurchaseForm from './PurchaseForm';

export default function PurchasePage() {
  return (
    <>
      <Helmet>
        <title>Purchase Form</title>
      </Helmet>
      <div className="container-fluid">
        <div className="row my-3">
          <div className="col">
            <PurchaseForm />
          </div>
        </div>
      </div>
    </>
  );
}
