import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './slices/deviceSlice';
import authReducer from './slices/authSlice';
import emissionReducer from './slices/emissionSlice';
import predictionReducer from './slices/predictionSlice';
import userReducer from './slices/userSlice';
import iotMockReducer from './slices/iotMockSlice';

export const store = configureStore({
    reducer: {
        devices: deviceReducer,
        auth: authReducer,
        emissions: emissionReducer,
        predictions: predictionReducer,
        users: userReducer,
        iotMock: iotMockReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 