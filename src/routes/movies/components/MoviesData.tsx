import React, { useEffect, useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Sheet from 'react-modal-sheet';

interface Props {
  selectedTab: string;
  myMovies: MoviesProps[];
  showKeys: any;
  setShowKeys: any;
}
interface MoviesProps {
  id: number;
  image: string;
  name: string;
  year: string;
  liked: boolean;
}

const MovieCardStyle = styled(Card)`
  img {
    height: 175px;
  }

  .card-img-overlay {
    top: 125px;

    .rating {
      height: 25px;
      line-height: 2
    }
  }
  .fa-star {
    color: #FF8A00;
  }
  .fa-thumbs-down {
    transform: rotateY(180deg);
  }
`;
const CustomSheet = styled(Sheet)`
  .react-modal-sheet-backdrop {
    background-color: black !important;
  }
`;

function MoviesData({
  selectedTab, myMovies, showKeys, setShowKeys,
}: Props) {
  const [keyboard, setKeyboard] = useState<string[]>([]);
  const [key, setKey] = useState<string>('');
  const generateAlphabet = () => {
    const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 97).toUpperCase());
    const number = [...Array(10)].map((_, i) => String.fromCharCode(i + 48));
    setKeyboard(['#', ...number, ...alphabet]);
  };
  useEffect(() => { generateAlphabet(); }, []);
  return (
    <div className="p-3 bg-dark rounded-3">
      {showKeys && (
        <>
          <Row className="d-none d-md-flex justify-content-center">
            <Col className="d-none d-md-block">
              <div className="d-flex flex-wrap justify-content-center">
                {keyboard.map((keys) => (
                  <Button
                    key={keys}
                    style={{ width: '35px', height: '35px' }}
                    onClick={() => setKey(keys)}
                    className={`border-0 shadow-none align-items-center d-flex fw-normal justify-content-center m-2 rounded-circle ${key !== keys ? 'bg-black' : ' bg-primary'}`}
                  >
                    {keys}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
          <CustomSheet
            className="d-md-none"
            isOpen={showKeys}
            onClose={() => setShowKeys(false)}
            snapPoints={[730, 400, 100, 0]}
          // initialSnap={1}
          // onSnap={(snapIndex) => console.log('> Current snap point index:', snapIndex)}
          >
            <Sheet.Container>
              <Sheet.Header />
              <Sheet.Content>{/* Your sheet content goes here */}</Sheet.Content>
            </Sheet.Container>

            <Sheet.Backdrop />
          </CustomSheet>
        </>
      )}
      <Row>
        {selectedTab === 'myMovies' ? myMovies.map((moviesData: MoviesProps) => (
          <Col xs={6} md={4} xxl={3} className="" key={moviesData.id}>
            <MovieCardStyle className="bg-transparent my-2">
              <Card.Img variant="top" src={moviesData.image} className="rounded-3" />
              <Card.ImgOverlay className="d-flex justify-content-end">
                <Card.Title className="rating bg-white mb-0 px-2 rounded-5 small text-black">
                  <FontAwesomeIcon icon={solid('star')} className="me-1" size="sm" />
                  3.0
                </Card.Title>
              </Card.ImgOverlay>
              <Card.Body className="px-0">
                <Card.Text className="d-flex justify-content-between align-items-center mb-1 small text-light">
                  {moviesData.year}
                  {moviesData.liked ? (
                    <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle border p-1" size="sm" />
                  ) : (
                    <FontAwesomeIcon icon={regular('thumbs-down')} className="text-primary rounded-circle border p-1" size="sm" />
                  )}
                </Card.Text>
                <Card.Text>
                  {moviesData.name}
                </Card.Text>
              </Card.Body>
            </MovieCardStyle>
          </Col>
        )) : (
          <h1 className="h4 text-center mb-0">No data found</h1>
        )}
      </Row>
    </div>

  );
}

export default MoviesData;
