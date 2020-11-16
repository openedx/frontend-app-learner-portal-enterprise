import React from 'react';
import PropTypes from 'prop-types';
import countryList from 'country-list';
import { Form, Button } from '@edx/paragon';
import { Form as FinalForm, Field } from 'react-final-form';

import {
  BULK_PURCHASE_PURCHASE_TYPE,
  PURCHASE_TYPE_FIELD,
  SUBSCRIPTION_PURCHASE_TYPE,
} from './constants';
import { createEnterpriseCustomer } from './service';

const Condition = ({ when, is, children }) => (
  <Field name={when} subscription={{ value: true }}>
    {({ input: { value } }) => (value === is ? children : null)}
  </Field>
);

Condition.propTypes = {
  when: PropTypes.string.isRequired,
  is: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const renderCountryChoices = () => {
  const countriesByCode = countryList.getCodeList();
  const options = [
    <option key="" value="">Please select a country</option>,
  ];
  const countries = Object.entries(countriesByCode).map(([countryCode, countryName]) => (
    <option key={countryCode} value={countryCode}>{countryName}</option>
  ));
  return options.concat(countries);
};

const FormControlAdapter = ({ input, ...rest }) => (
  <Form.Group countrolId={PURCHASE_TYPE_FIELD}>
    <Form.Label>Purchase Type</Form.Label>
    <Form.Control
      {...input}
      {...rest}
    />
  </Form.Group>
);

FormControlAdapter.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    value: PropTypes.string,
  }).isRequired,
};

const PurchaseForm = () => (
  <FinalForm
    onSubmit={createEnterpriseCustomer}
    render={({
      handleSubmit,
      submitting,
      pristine,
      values,
    }) => (
      <Form onSubmit={handleSubmit}>
        {/* TODO: Use full form from paragon */}
        <Field name={PURCHASE_TYPE_FIELD} component={FormControlAdapter} as="select" required custom>
          <option value="">Please select a purchase type</option>
          <option value={BULK_PURCHASE_PURCHASE_TYPE}>Bulk Purchase</option>
          <option value={SUBSCRIPTION_PURCHASE_TYPE}>Subscription</option>
        </Field>
        {/* <div>
          <label>Purchase Type</label>
          <Field name={PURCHASE_TYPE_FIELD} component="select" required>
            <option value="">Please select a purchase type</option>
            <option value={BULK_PURCHASE_PURCHASE_TYPE}>Bulk Purchase</option>
            <option value={SUBSCRIPTION_PURCHASE_TYPE}>Subscription</option>
          </Field>
        </div> */}

        {/* TODO: field validation */}
        <div>
          <label>Enterprise Name</label>
          <Field
            name="enterpriseName"
            component="input"
            type="text"
            placeholder="Pied Piper"
            required
          />
        </div>

        <div>
          <label>Enterprise Country</label>
          <Field name="enterpriseCountry" component="select" required>
            {renderCountryChoices()}
          </Field>
        </div>

        <div>
          <label>Enterprise Contact Email</label>
          <Field
            name="enterpriseEmail"
            component="input"
            type="email"
            placeholder="admin@example.com"
            required
          />
        </div>

        <Condition when={PURCHASE_TYPE_FIELD} is={BULK_PURCHASE_PURCHASE_TYPE}>
          {/* TODO: How do you pick a course */}
          <div>
            <label>Course Key</label>
            <Field
              name="courseKey"
              component="input"
              type="text"
              placeholder="edX+demoX"
              required
            />
          </div>
        </Condition>

        <Condition when={PURCHASE_TYPE_FIELD} is={SUBSCRIPTION_PURCHASE_TYPE}>
          <div>
            <label>Number of Learners</label>
            <Field
              name="numberOfLearners"
              component="input"
              type="number"
              placeholder="25"
              min="1"
              required
            />
          </div>

          <div>
            <label>Duration (Months)</label>
            <Field
              name="duration"
              component="input"
              type="number"
              placeholder="12"
              min="1"
              max="12"
              required
            />
          </div>

          {/* TODO: How do you pick a catalog */}
        </Condition>

        <Button variant="primary" type="submit" disabled={submitting || pristine}>
          Submit
        </Button>

        <pre>{JSON.stringify(values, 0, 2)}</pre>

      </Form>
    )}
  />
);

// react-bootstrap form elements
// <Form.Group controlId="enterpriseName">
//   <Form.Label>Enterprise Name</Form.Label>
//   <Field name="enterpriseName" component={Form.Control} type="text" placeholder="Pied Piper" required />
//   {/* <Field name="firstName" component="input" /> */}
// </Form.Group>

// {/* TODO: Country selector */}
// <Form.Group controlId="enterpriseCountry">
//   <Form.Label>Enterprise Country</Form.Label>
//   <Form.Control as="select" defaultValue="Choose..." required>
//     <option>Choose...</option>
//     <option>...</option>
//   </Form.Control>
// </Form.Group>

// <Form.Group controlId="enterpriseContactEmail">
//   <Form.Label>Enterprise Contact Email</Form.Label>
//   <Form.Control type="email" placeholder="admin@example.com" required />
// </Form.Group>

// {/* TODO: UX on finding and selecting a course */}
// <Form.Group controlId="courseKey">
//   <Form.Label>Course Key</Form.Label>
//   <Form.Control type="text" placeholder="edX+demoX" required />
// </Form.Group>

// <Button variant="primary" type="submit" disabled={submitting || pristine}>
//   Submit
// </Button>

export default PurchaseForm;
