import { createSlice } from "@reduxjs/toolkit";

//

/* ----------------------------------------------------------- */
const initialState = {
  sidebar: {
    open: false,
    type: "CONTACT", // can be CONTACT, STARRED, SHARED
  },
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Toggle Sidebar
    toggleSideBar(state) {
      state.sideBar.open = !state.sideBar.open;
    },
    updateSideBarType(state, action) {
      state.sideBar.type = action.payload.type;
    },
  },
});

// Reducer
export default slice.reducer;
//
export function toggleSideBar() {}
export function UpdateSidebarType() {}
