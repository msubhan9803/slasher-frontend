import React, { useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { healthCheck } from '../api/health-check';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setIsServerAvailable } from '../redux/slices/serverAvailableSlice';
import CustomModal from './ui/CustomModal';
import useProgressButton from './ui/ProgressButton';

export default function ServerUnavailable() {
  const isServerAvailable = useAppSelector((state) => state.serverAvailability.isAvailable);
  const dispatch = useAppDispatch();
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();

  const show = !isServerAvailable;

  const handleTryAgain = () => {
    setProgressButtonStatus('loading');
    healthCheck().then((res) => {
      if (res.data.status === 'ok') {
        setProgressButtonStatus('success');
        setTimeout(() => dispatch(setIsServerAvailable(true)), 500);
      }
    }).catch(() => {
      setTimeout(() => setProgressButtonStatus('failure'), 500);
    });
  };

  return (
    <div>
      <CustomModal show={show} centered size="sm">
        <Modal.Header className="border-0 shadow-none justify-content-end" />
        <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
          <h1 className="h3 text-primary">Unable to reach the server.</h1>
          <p className="px-3">Please check your internet connection and try again.</p>
          <ProgressButton className="mb-3 w-100 fs-3" label="Try again" onClick={handleTryAgain} />
        </Modal.Body>
      </CustomModal>
    </div>
  );
}
