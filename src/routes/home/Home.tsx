import React from 'react';
import { Link } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

function Home() {
  return (
    <div className="home">
      <h1>Home</h1>
      <p>This is a placeholder home page!</p>
      <p>
        <Link to="/registration">Go to the registration page</Link>
        <br />
        <br />
        <ToggleButtonGroup
          exclusive
          aria-label="text alignment"
        >
          <ToggleButton value="left" aria-label="left aligned">
            <ThumbUpIcon color="info" />
          </ToggleButton>
          <ToggleButton value="center" aria-label="centered">
            <ThumbUpIcon color="warning" />
          </ToggleButton>
          <ToggleButton value="right" aria-label="right aligned">
            <ThumbUpIcon color="error" />
          </ToggleButton>
        </ToggleButtonGroup>
      </p>
    </div>
  );
}

export default Home;
