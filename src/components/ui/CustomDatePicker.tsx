import React, { useRef, useState } from 'react';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface Props {
  date: Date | null;
  setDate: (val: any) => void;
  label: string;
}

function CustomDatePicker({ date, setDate, label }: Props) {
  const color = 'var(--bs-link-color)';
  const [open, setOpen] = useState(false);
  const dateSelectedRef = useRef(false);
  const handleOpen = () => setOpen(true);
  // `handleOnFocus` handles opening of calendar when `input` is focussed by keyboard <tab> key
  const handleOnFocus = () => {
    if (dateSelectedRef.current) { return; }
    dateSelectedRef.current = true;
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const theme = createTheme({
    components: {
      MuiIconButton: {
        styleOverrides: {
          sizeMedium: {
            color,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            color,
            borderRadius: '0.625rem',
            outline: 'none',
            boxShadow: 'none',
            fontSize: '1rem',
            '& fieldset': {
              borderColor: '#3A3B46 !important',
            },
            '&:hover fieldset': {
              borderColor: '#3A3B46 !important',

            },
            '&.Mui-focused fieldset': {
              borderColor: '#3A3B46 !important',

            },

          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color,
            '&.Mui-focused': {
              color: 'white',
            },
          },
        },
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          label={label}
          inputFormat="MM/dd/yyyy"
          value={date}
          open={open}
          onOpen={handleOpen}
          InputProps={{ onClick: handleOpen, onFocus: handleOnFocus }}
          onClose={handleClose}
          onChange={(newValue) => {
            setDate(newValue);
          }}
          renderInput={(params: any) => <TextField {...params} sx={{ width: '100%' }} />}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default CustomDatePicker;
