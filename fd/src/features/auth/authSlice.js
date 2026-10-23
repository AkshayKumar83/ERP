import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_API_URL } from "../../utils/constants";

// export const updateUserProfile = createAsyncThunk(
//   "auth/updateUserProfile",
//   async (userData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${BASE_API_URL}/user-profile/update`,
//         userData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// const initialState = {
//   // isAuthenticated: false,
//   isAuthenticated: document.cookie.includes("auth_token"),
//   user: null,
//   loading: false,
//   error: null,
// };

// export const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action) => {
//       state.user = action.payload;
//       state.isAuthenticated = true;
//     },

//     logout: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;

//       // Optional: clear persisted state manually if needed
//     localStorage.setItem("logout", Date.now());  // Trigger 'storage' event in other tabs
//     sessionStorage.removeItem("isLoggedIn");

//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(updateUserProfile.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateUserProfile.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//       })
//       .addCase(updateUserProfile.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;

// export const selectCurrentUser = (state) => state.auth.user;
// export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
// export const selectAuthLoading = (state) => state.auth.loading;
// export const selectAuthError = (state) => state.auth.error;

// export default authSlice.reducer;


export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_API_URL}/user-profile/update`,
        userData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Something went wrong"
      );
    }
  }
);

const initialState = {
  // isAuthenticated: document.cookie.includes("auth_token"),
    isAuthenticated: false, // ✅ redux-persist rehydrates the real value
  user: null,
  loading: false,
  error: null,
  success: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.setItem("logout", Date.now());
       localStorage.removeItem("isLoggedIn");       // ✅ add this
        localStorage.removeItem("user");             // ✅ add this
      sessionStorage.removeItem("isLoggedIn");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload }; // merge updates
        state.success = "Profile updated successfully!";
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      });
  },
});



export const { setCredentials, logout } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
