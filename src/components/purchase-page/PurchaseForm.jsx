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

const FormControlAdapter = ({ label, input, ...rest }) => (
  // TODO: Fix control id
  <Form.Group countrolId={PURCHASE_TYPE_FIELD}>
    <Form.Label>{label}</Form.Label>
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
        {/* TODO: field validation */}

        <Field name={PURCHASE_TYPE_FIELD} component={FormControlAdapter} as="select" required custom label="Purchase Type">
          <option value="">Please select a purchase type</option>
          <option value={BULK_PURCHASE_PURCHASE_TYPE}>Bulk Purchase</option>
          <option value={SUBSCRIPTION_PURCHASE_TYPE}>Subscription</option>
        </Field>

        <Field
          name="enterpriseName"
          component={FormControlAdapter}
          type="text"
          placeholder="Pied Piper"
          label="Enterprise Name"
          required
        />

        <Field
          name="enterpriseCountry"
          component={FormControlAdapter}
          as="select"
          placeholder="Pied Piper"
          label="Enterprise Country"
          custom
          required
        >
          {renderCountryChoices()}
        </Field>

        <Field
          name="enterpriseEmail"
          component={FormControlAdapter}
          type="email"
          placeholder="admin@example.com"
          label="Enterprise Contact Email"
          required
        />

        <Condition when={PURCHASE_TYPE_FIELD} is={BULK_PURCHASE_PURCHASE_TYPE}>
          {/* TODO: How do you pick a course */}
          <Field
            name="courseKey"
            label="Course Key"
            component={FormControlAdapter}
            type="text"
            placeholder="edX+demoX"
            required
          />
        </Condition>

        <Condition when={PURCHASE_TYPE_FIELD} is={SUBSCRIPTION_PURCHASE_TYPE}>
          <Field
            name="numberOfLearners"
            label="Number of Learners"
            component={FormControlAdapter}
            type="number"
            placeholder="25"
            min="1"
            required
          />

          <Field
            name="duration"
            label="Duration (Months)"
            component={FormControlAdapter}
            type="number"
            placeholder="12"
            min="1"
            max="12"
            required
          />
          {/* TODO: How do you pick a catalog */}
        </Condition>

        <Button variant="primary" type="submit" disabled={submitting || pristine}>
          Submit
        </Button>

        <pre className="mt-3">{JSON.stringify(values, 0, 2)}</pre>

      </Form>
    )}
  />
);

export default PurchaseForm;
