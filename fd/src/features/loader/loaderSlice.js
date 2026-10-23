import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  global: false, // for full-page loader
  form: false,

};

const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    setLoader: (state, action) => {
      const { key, value } = action.payload;
      if (key in state) state[key] = value;
    },
    resetAllLoaders: () => initialState,
  },
});

export const { setLoader, resetAllLoaders } = loaderSlice.actions;

export const selectLoader = (key) => (state) => state.loader[key];
export default loaderSlice.reducer;
