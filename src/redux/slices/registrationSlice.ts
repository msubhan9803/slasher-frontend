import { createSlice } from '@reduxjs/toolkit';

export const registrationSlice = createSlice({
  name: 'registration',
  initialState: {
    firstName: '',
    userName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    securityQuestion: '',
    securityAnswer: '',
    month: 0,
    year: 0,
    day: 0,
  },
  reducers: {
    setIdentityFields: (state, action) => ({
      ...state,
      firstName: action.payload.firstName,
      userName: action.payload.userName,
      email: action.payload.email,
    }),
    setSecurityFields: (state, action) => ({
      ...state,
      password: action.payload.password,
      passwordConfirmation: action.payload.passwordConfirmation,
      securityQuestion: action.payload.securityQuestion,
      securityAnswer: action.payload.securityAnswer,
      month: action.payload.month,
      year: action.payload.year,
      day: action.payload.day,
    }),
  },
});

export const { setIdentityFields, setSecurityFields } = registrationSlice.actions;

export default registrationSlice.reducer;
