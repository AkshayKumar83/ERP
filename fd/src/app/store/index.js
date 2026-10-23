import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from '../../features/auth/authSlice';
import loaderReducer from '../../features/loader/loaderSlice';

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  loader: loaderReducer, 
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific actions or paths related to redux-persist
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['auth'], // Optional: if you want to ignore the auth state entirely for serialization check
      },
    }),
});



export const persistor = persistStore(store);
export default store;
