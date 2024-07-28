import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CharactersCounter from '../CharactersCounter';

type Props = {
  description: string;
  handleMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  charCount: number
};

export default function ListingOverview({ description, handleMessageChange, charCount }: Props) {
  return (
    <Col xs="12" className="my-2">
      <Form.Group className="fs-5" controlId="Overview">
        <Form.Control
          maxLength={113}
          rows={6}
          as="textarea"
          value={description}
          onChange={handleMessageChange}
          placeholder="Overview"
          style={{ resize: 'none' }}
          className="fs-4"
        />
        <CharactersCounter
          counterClass="float-end fs-5 me-2"
          charCount={charCount}
          totalChar={113}
        />
      </Form.Group>
    </Col>
  );
}
