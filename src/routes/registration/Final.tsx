import React from 'react';
import { Container, Image } from 'react-bootstrap';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import send from '../../images/send.svg';
import slasherLogo from '../../images/slasher-logo.svg';

function Final() {
  return (
    <UnauthenticatedSiteWrapper>
      <Container>
        <div className="d-flex d-sm-block justify-content-center">
          <Image src={slasherLogo} />
        </div>
        <div className="d-flex flex-column align-items-center text-center">
          <Image src={send} />
          <h2 className="mt-4 fw-bold">One more step!</h2>
          <h2 className="fw-bold">Verify your email</h2>
          <p className="mt-3 fs-6">We have sent an email to</p>
          <h3 className=" text-primary fw-bold">jzb@upwork.com</h3>
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
          <div className="d-flex flex-sm-row justify-content-center flex-column">
            <p className="fs-4">Need help?</p>
            <p className="fs-4">&nbsp;Please email help@slasher.tv for assistance.</p>
          </div>
        </div>
      </Container>
    </UnauthenticatedSiteWrapper>
  );
}
export default Final;
