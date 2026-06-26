import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // ✅ NEW import
import store, { persistor } from './Redux/store'; // ✅ FIX — persistor bhi import
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'; // ✅ NEW

// ✅ NEW — har axios request ke saath httpOnly cookie automatically bhejne ke liye.
// Isse alag se "Authorization: Bearer token" header lagane ki zaroorat khatam ho jaati hai —
// backend ka cors({credentials:true}) already isi ke liye configured hai.
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 // <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();