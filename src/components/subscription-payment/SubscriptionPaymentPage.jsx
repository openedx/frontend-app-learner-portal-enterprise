import React, { useMemo, useState, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import qs from 'query-string';
import {
  Card,
  Form,
  Input,
  Button,
  Container,
  Col,
  Row,
  ValidationFormGroup,
} from '@edx/paragon';
import {
  RecurlyProvider,
  CardElement,
  Elements,
  useRecurly,
  useCheckoutPricing,
} from '@recurly/react-recurly';

import { sendRecurlyToken } from './data/service';

const PaymentForm = () => {
  const location = useLocation();
  const history = useHistory();
  const queryParams = qs.parse(location.search, { parseNumbers: true });
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    company: '',
  });

  const pricingInput = useMemo(() => ({
    subscriptions: [
      {
        plan: queryParams.plan,
      },
    ],
    adjustments: [
      {
        itemCode: queryParams.item,
        quantity: queryParams.quantity || 1,
      },
    ],
  }), [queryParams.plan, queryParams.item, queryParams.quantity]);

  const [{ price, loading }, setCheckoutPricing] = useCheckoutPricing(pricingInput);

  const recurly = useRecurly();
  const formRef = useRef();

  const formatCurrency = (priceToFormat) => {
    if (!priceToFormat) {
      return null;
    }

    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: price.currency.code,
    });
    return formatter.format(priceToFormat);
  };

  const handlePersonalInfoChange = (name, value) => {
    setPersonalInfo(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleQuantityChange = (quantity) => {
    if (pricingInput.adjustments.length > 0) {
      const updatedAdjustment = {
        ...pricingInput.adjustments[0],
        quantity: quantity > 0 ? quantity : 1,
      };
      setCheckoutPricing({
        ...pricingInput,
        adjustments: [updatedAdjustment],
      });
      history.push({
        pathname: location.pathname,
        search: `?${qs.stringify({ ...queryParams, quantity })}`,
      });
    }
  };

  const handleSubmit = (event) => {
    if (event.preventDefault) {
      event.preventDefault();
    }

    recurly.token(formRef.current, (err, token) => {
      if (err) {
        console.log('[error]', err);
      } else {
        console.log('[token]', token);
        console.log(pricingInput, personalInfo);
        const recurlyData = {
          plan_code: pricingInput.subscriptions[0].plan,
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          company: personalInfo.company,
          item_code: pricingInput.adjustments[0].itemCode,
          quantity: pricingInput.adjustments[0].quantity,
          token_id: token.id,
        };
        sendRecurlyToken(recurlyData).then(() => {
          console('subscription successfully purchased!');
        });
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit} ref={formRef}>
      <Row>
        <Col>
          <h2>Personal Information</h2>
          <Form.Row>
            <Col md={6}>
              <ValidationFormGroup for="firstName">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="firstName">First name</label>
                <Input
                  type="text"
                  id="firstName"
                  name="first-name"
                  data-recurly="first_name"
                  onChange={e => handlePersonalInfoChange('firstName', e.target.value)}
                  required
                />
              </ValidationFormGroup>
            </Col>
            <Col>
              <ValidationFormGroup for="lastName">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="lastName">Last name</label>
                <Input
                  type="text"
                  id="lastName"
                  name="last-name"
                  data-recurly="last_name"
                  onChange={e => handlePersonalInfoChange('lastName', e.target.value)}
                  required
                />
              </ValidationFormGroup>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col md={6}>
              <ValidationFormGroup for="companyOrgName">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="companyOrgName">Company / Organization name</label>
                <Input
                  type="text"
                  id="companyOrgName"
                  name="company-org-name"
                  data-recurly="company"
                  onChange={e => handlePersonalInfoChange('company', e.target.value)}
                />
              </ValidationFormGroup>
            </Col>
          </Form.Row>
          <h2 className="mt-3">Billing Information</h2>
          <Form.Row>
            <Col>
              <ValidationFormGroup for="address1">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="address1">Address</label>
                <Input
                  type="text"
                  id="address1"
                  name="address1"
                  data-recurly="address1"
                />
              </ValidationFormGroup>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <ValidationFormGroup for="city">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="city">City</label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  data-recurly="city"
                />
              </ValidationFormGroup>
            </Col>
            <Col>
              <ValidationFormGroup for="state">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="state">State</label>
                <Input
                  type="select"
                  id="state"
                  name="state"
                  data-recurly="state"
                  options={[
                    { value: 'MA', label: 'Massachusetts' },
                  ]}
                />
              </ValidationFormGroup>
            </Col>
            <Col xs={3}>
              <ValidationFormGroup for="postalCode">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="postalCode">Postal code</label>
                <Input
                  type="text"
                  id="postalCode"
                  name="postal-code"
                  data-recurly="postal_code"
                />
              </ValidationFormGroup>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <ValidationFormGroup for="country">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="country">Country</label>
                <Input
                  type="select"
                  id="country"
                  name="country"
                  data-recurly="country"
                  options={[
                    { value: 'US', label: 'United States of America' },
                  ]}
                />
              </ValidationFormGroup>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col>
              <Form.Group>
                <CardElement
                  style={{
                    fontColor: '#454545',
                    fontFamily: 'Roboto, Arial, sans-serif',
                  }}
                />
              </Form.Group>
            </Col>
          </Form.Row>
          <Form.Row className="mt-3">
            <Form.Group>
              <Button type="submit">Pay now</Button>
            </Form.Group>
          </Form.Row>
        </Col>
        <Col xs={12} lg={4} className="offset-lg-1 mt-3 mt-md-0">
          <Card>
            <Card.Header>
              <h3 className="h4">Confirm your purchase</h3>
            </Card.Header>
            <Card.Body>
              <>
                <Row className="mb-2 py-1">
                  <Col>
                    <div className="d-flex align-items-center">
                      <div style={{ flexGrow: 1 }}>
                        User{' '}
                        x{' '}
                      </div>
                      <div className="ml-3">
                        <ValidationFormGroup className="d-inline-block" for="quantity">
                          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                          <label htmlFor="quantity">Quantity</label>
                          <Input
                            type="number"
                            value={queryParams.quantity || 1}
                            id="quantity"
                            name="quantity"
                            onChange={e => handleQuantityChange(e.target.value)}
                            width={50}
                            required
                          />
                        </ValidationFormGroup>
                      </div>
                    </div>
                  </Col>
                </Row>
              </>
              <Row className="border-top border-light py-2">
                <Col className="font-weight-bold">
                  Total
                </Col>
                <Col className="text-right">
                  {price.now?.total && formatCurrency(price.now.total)}
                </Col>
              </Row>
              <Button type="submit" className="btn-block mt-3">Pay now</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default function SubscriptionPaymentPage() {
  return (
    <Container className="py-5">
      <RecurlyProvider publicKey={process.env.RECURLY_PUBLIC_KEY}>
        <Elements>
          <Row>
            <Col>
              <PaymentForm />
            </Col>
          </Row>
        </Elements>
      </RecurlyProvider>
    </Container>
  );
}
