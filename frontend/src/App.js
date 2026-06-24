import { BrowserRouter, Routes, Route } from "react-router-dom";
import User from "./pages/User/User";
import Home from "./pages/Home/Home";
import UserHome from "./components/Home/Home";
import Notification from "./components/Notification/Notification";
import Appointments from "./components/Appointments/Appointments";
import MyPrescriptions from "./components/Prescription/MyPrescriptions";
import MyProfile from "./components/Profile/MyProfile"; 
import { useSelector } from "react-redux";
import Spinner from "./components/Spinner.js";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes.jsx";
import ProtectedDoctorRoute from "./components/ProtectedRoutes/ProtectedDoctorRoutes.jsx";
import Doctor from "./pages/Doctor/Doctor.js";
import Conversation from "./components/conversation/Conversation.js";

function App() {
  const { loading } = useSelector((state) => state.alert);
  return (
    <>
      <BrowserRouter>
        {loading ? (
          <Spinner />
        ) : (
          <Routes>
            <Route exact path="/" element={<Home />} />

            <Route
              path="/User"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            >
              <Route path="Notification" element={<Notification />} />
              <Route path="Appointments" element={<Appointments />} />
              <Route path="Prescriptions" element={<MyPrescriptions />} />
              <Route path="Profile" element={<MyProfile />} /> {/* ✅ NEW */}
              <Route path="Conversation" element={<Conversation />} />
              <Route index element={<UserHome />} />
            </Route>
            <Route
              path="/Doctor"
              element={
                <ProtectedDoctorRoute>
                  <Doctor />
                </ProtectedDoctorRoute>
              }
            />
          </Routes>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;