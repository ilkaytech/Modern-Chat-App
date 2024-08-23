import { createSlice } from "@reduxjs/toolkit";

//

/* ----------------------------------------------------------- */
const initialState = {
  sidebar: {
    open: false,
    type: "CONTACT", // can be CONTACT, STARRED, SHARED
  },
  snackbar: {
    open: false,
    message: null,
    severity: null,
  },
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Toggle Sidebar
    toggleSideBar(state) {
      state.sidebar.open = !state.sidebar.open;
    },
    updateSideBarType(state, action) {
      state.sidebar.type = action.payload.type;
    },
    openSnackBar(state, action) {
      console.log(action.payload);
      state.snackbar.open = true;
      state.snackbar.severity = action.payload.severity;
      state.snackbar.message = action.payload.message;
    },
    closeSnackBar(state) {
      console.log("This is getting executed");
      state.snackbar.open = false;
      state.snackbar.message = null;
    },
  },
});

// Reducer
export default slice.reducer;
//
export function ToggleSidebar() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.toggleSideBar());
  };
}

export function UpdateSidebarType(type) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateSideBarType({ type }));
  };
}

export const showSnackbar =
  ({ severity, message }) =>
  async (dispatch, getState) => {
    dispatch(
      slice.actions.openSnackBar({
        message,
        severity,
      })
    );

    setTimeout(() => {
      dispatch(slice.actions.closeSnackBar());
    }, 4000);
  };

export const closeSnackBar = () => async (dispatch, getState) => {
  dispatch(slice.actions.closeSnackBar());
};
