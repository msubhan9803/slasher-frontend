import { createSlice } from '@reduxjs/toolkit';

export const scrollPositionSlice = createSlice({
  name: 'scrollPosition',
  initialState: {
    pathname: '',
    position: 0,
    data: [],
    positionElementId: '',
    searchValue: '',
    sortValue: 'name',
    selectedKey: '',
  },
  reducers: {
    setScrollPosition: (state, action) => ({
      ...state,
      pathname: action.payload.pathname,
      position: action.payload.position,
      data: action.payload.data,
      positionElementId: action.payload.positionElementId,
      searchValue: action.payload.searchValue ? action.payload.searchValue : '',
      sortValue: action.payload.sortValue ? action.payload.sortValue : 'name',
      selectedKey: action.payload.selectedKey ? action.payload.selectedKey : '',
    }),
  },
});

export const { setScrollPosition } = scrollPositionSlice.actions;

export default scrollPositionSlice.reducer;
