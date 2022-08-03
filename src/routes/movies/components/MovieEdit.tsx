import React from 'react';
import { Form } from 'react-bootstrap';

function MovieEdit() {
  return (
    <div className="bg-dark p-3">
      <Form>
        <div>
          {/* <Image /> */}
          <h1 className="h3 fe-bold">Upload cover art</h1>
          <p className="fs-5 text-light">Recommended size: 600x900 pixels (jpg, png)</p>
        </div>
      </Form>
    </div>
  );
}

export default MovieEdit;
