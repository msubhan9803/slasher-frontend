import React from 'react';
import { Button } from 'react-bootstrap';
import RoundedGreenTick from '../../../../images/dating-round-tick.png';
import DatingBestDeal from '../../../../images/dating-best-deal-sticker.png';

function BuyButton({
  currentMonth,
  currentPrice,
  currentSavings = 0,
  isBestDeal = false,
  planMonths,
  setPlanMonths,
}: any) {
  const successColorBootstrap = getComputedStyle(document.body).getPropertyValue('--bs-success');
  return (
    <Button
      variant={planMonths === currentMonth ? 'success' : 'dark'}
      className="mx-auto bg-dark mb-3 position-relative rounded-4 px-4 pb-4 d-flex justify-content-between align-items-center"
      name="6-month"
      onClick={() => setPlanMonths(currentMonth)}
      style={{
        borderColor: planMonths === currentMonth ? successColorBootstrap : '#464646',
        borderWidth: 2,
        width: '93%',
        paddingTop: isBestDeal ? 30 : '1.5rem',
      }}
    >
      {planMonths === currentMonth && (
      <img
        className="position-absolute"
        src={RoundedGreenTick}
        width="30"
        alt="rounded active tick"
        style={{ right: -15 }}
      />
      )}
      {isBestDeal && (
      <img className="position-absolute top-0 start-0" src={DatingBestDeal} height="30" alt="Best Deal Sticker" />
      )}

      <div className="d-flex justify-content-center align-items-center">
        <span className="text-success fw-bold fs-1 me-3">{currentMonth}</span>
        <span className="fw-normal text-light"> months</span>
      </div>
      <div className="text-primary me-3 fs-2 d-flex flex-column align-items-end">
        <div>
          $
          {currentPrice}
        </div>
        {currentSavings !== 0 && (
        <div className="fs-3 fw-normal text-light">
          Save $
          {currentSavings}
        </div>
        )}
      </div>
    </Button>
  );
}

export default BuyButton;
