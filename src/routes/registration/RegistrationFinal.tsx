import React from 'react';
import { Container, Image } from 'react-bootstrap';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import send from '../../images/send.svg';
import slasherLogo from '../../images/slasher-logo.svg';

function RegistrationFinal() {
  return (
    <UnauthenticatedSiteWrapper>
      <Container>
        <div className="text-center text-md-start mb-5">
          <Image src={slasherLogo} />
        </div>
        <div className="text-center">
          <Image src={send} />
          <h2 className="mt-4">One more step!</h2>
          <h3 className="mb-4">Verify your email</h3>
          <p>We have sent an email to</p>
          <p className="fs-3 text-primary fw-bold my-3">jzb@upwork.com</p>
          <p>
            Click or tap the button in the email to activate your
            Slasher account.
          </p>
          <p>
            If you do not receive the account activation email, be sure to check your junk or spam
            folder.
          </p>
          <p>
            We look forward to seeing you and hope you have a great time with us!
          </p>
          <div className="d-flex flex-md-row justify-content-center flex-column mt-5">
            <p className="fs-4">Need help?</p>
            <p className="fs-4">&nbsp;Please email help@slasher.tv for assistance.</p>
          </div>
        </div>
      </Container>
    </UnauthenticatedSiteWrapper>
  );
}
export default RegistrationFinal;
