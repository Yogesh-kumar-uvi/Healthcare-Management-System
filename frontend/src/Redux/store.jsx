import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./CartSlice"
import tokenReducer from "./TokenSllice"
import AlertSlice from "./AlertSlice";
import UserSlice from "./UserSlice";
import DoctorSlice from "./DoctorSlice";

// ✅ NEW — persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "doctor", "cart"], // sirf inhe persist karo, alert/token nahi
};

const rootReducer = combineReducers({
  cart: cartReducer,
  alert: AlertSlice,
  token: tokenReducer,
  user: UserSlice,
  doctor: DoctorSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ redux-persist ke non-serializable actions allow karne ke liye
    }),
});

export const persistor = persistStore(store); // ✅ NEW export

export default store;