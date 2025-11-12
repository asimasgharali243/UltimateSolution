// store/slices/customizationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: 'dashboard', // for active default menu
  navType: '',
  drawerOpen: false,
};

const customizationSlice = createSlice({
  name: 'customization',
  initialState,
  reducers: {
    menuOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    menuType: (state, action) => {
      state.navType = action.payload;
    },
    setDrawerOpen: (state, action) => {
      state.drawerOpen = action.payload;
    },
  },
});

export const { menuOpen, menuType, setDrawerOpen } = customizationSlice.actions;
export default customizationSlice.reducer;