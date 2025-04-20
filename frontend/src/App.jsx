import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ContactUs from "./pages/ContactUs";
import Navbar from "./components/Navbar";
import Videos from "./pages/Videos";
import BrowseVideos from "./pages/BrowseVideos";
import Admin from "./pages/Admin";
import { useState, useEffect } from "react";
import API from "./utils/api";

const PrivateRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await API.get("/auth/user");
        setIsAdmin(response.data.isAdmin || false);
      } catch (error) {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    if (localStorage.getItem("token")) {
      checkAdmin();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/videos"
          element={
            <PrivateRoute>
              <Videos />
            </PrivateRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <PrivateRoute>
              <BrowseVideos />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminRoute>
                <Admin />
              </AdminRoute>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
