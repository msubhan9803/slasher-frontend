import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
    Button,
    Container,
    Form,
    Image,
} from 'react-bootstrap';
import slasherLogo from '../../images/slasher-logo.svg';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';

const EmailVerificationContainer = styled(Container)`
padding-bottom: 6rem;

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

export default function EmailVerificationNotReceived() {
    return (
        <UnauthenticatedSiteWrapper>
            <div className="d-flex d-sm-block justify-content-center">
                <Image src={slasherLogo} />
            </div>
            <EmailVerificationContainer>
                <div className="d-flex flex-column justify-content-center text-center mt-3 mt-lg-5">
                    <h2>Verification Email Not Received</h2>
                    <p className='mt-3'>
                        If you created a Slasher account and never received the
                        verification email to activate your account, please<br/>enter
                        your email address below and we will send another activation
                        email to you. Please allow up to<br/>30 minutes to receive a new
                        email and be sure to check your spam folder if you do not see
                        it within 30 minutes.
                    </p>
                    <Form className="row d-flex flex-column align-items-center">
                        <div className="col-lg-4 col-md-6 col-sm-8 col-10">
                            <Form.Control className="text-white shadow-none" type="email" placeholder="Email address" />
                            <Button className="mt-3 w-100">Send</Button>
                        </div>
                    </Form>

                    <p className="lastParagraph">
                        If you have already done this and never received the email,
                        please let us know by emailing us at<br/>
                        <Link to="/email-verification-not-received" className="text-decoration-none">
                            <span>
                                help@slasher.tv
                            </span>
                        </Link>
                        &nbsp;from the email address you used when you created your
                        account and include your<br/>Slasher username as well. We will
                        be happy to help you!
                    </p>
                </div>
            </EmailVerificationContainer>
        </UnauthenticatedSiteWrapper>
    )
}