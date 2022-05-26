import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Form,
  Image,
} from 'react-bootstrap';
import styled from 'styled-components';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import slasherLogo from '../../images/slasher-logo.svg';

const ForgotPasswordContainer = styled(Container)`
  padding-bottom: 3.35rem;

  form{
    margin-top:2rem;
    input {
      border-radius: 10px;
      background-color: #1F1F1F;
      border: 1px solid #3A3B46;
      &:focus {
        background-color: #1F1F1F;
        border: 1px solid #3A3B46;
      }
    }
  }
 
  span {
    color: red
  }

  .lastParagraph {
    margin-top:2rem
  }
  
`;

function ForgotPassword() {
  return (
    <UnauthenticatedSiteWrapper>
      <ForgotPasswordContainer>
        <div className="d-flex d-sm-block justify-content-center">
          <Image src={slasherLogo} />
        </div>
        <div className="d-flex flex-column justify-content-center text-center mt-3 mt-lg-2">
          <h2>Forgot your password?</h2>
          <p>That’s ok - we’re here to help!</p>
          <p className="mt-4">
            Enter the email address associated with your Slasher account below and
            we’ll send you a link to reset your<br/>password.Be sure to check your spam
            folder if you don’t see the email within 15 minutes.
          </p>
          <p>
            <span>
              NOTE:&nbsp;
            </span>
            If you just created an account and you are
            not able to login, be sure you activated your account by clicking<br/>the button
            in the email we sent when you created your account. Your account will not be
            activated until you click the<br/>button in that email.
          </p>
          <p>
            Please check your spam folder for the email. If you have not received it,
            please&nbsp;
            <Link to="/" className="text-decoration-none">
              click here
            </Link>
            .
          </p>
          <Form className="row d-flex flex-column align-items-center">
            <div className="col-lg-4 col-md-6 col-sm-8 col-10">
              <Form.Control className="text-white shadow-none" type="email" placeholder="Email address" />
              <Button className="mt-3 w-100">Send</Button>
            </div>
          </Form>

          <p className="lastParagraph">
            If you haven’t gotten an email, please send an email to&nbsp;
            <Link to="/" className="text-decoration-none">
              <span>
                help@slasher.tv
              </span>
            </Link>
            &nbsp;and let us know.<br/>
            Be sure to include your username in the email too.
          </p>
        </div>
      </ForgotPasswordContainer>
    </UnauthenticatedSiteWrapper>
  );
}

export default ForgotPassword;
