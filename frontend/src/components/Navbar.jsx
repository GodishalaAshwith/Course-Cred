import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition duration-300 ${
        scrolled ? "bg-indigo-600 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link
          to="/"
          className="text-3xl font-bold tracking-wide text-white hover:text-indigo-300 transition duration-300"
        >
          CourseCred
        </Link>

        <div className="space-x-6 flex items-center">
          <Link
            to="/"
            className="text-white hover:text-indigo-300 px-4 py-2 rounded-lg transition duration-300"
          >
            Home
          </Link>
          <Link
            to="/contactus"
            className="text-white hover:text-indigo-300 px-4 py-2 rounded-lg transition duration-300"
          >
            Contact
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-white hover:text-indigo-300 px-4 py-2 rounded-lg transition duration-300"
              >
                Dashboard
              </Link>
              <Link
                to="/videos"
                className="text-white hover:text-indigo-300 px-4 py-2 rounded-lg transition duration-300"
              >
                Videos
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:text-indigo-300 px-4 py-2 rounded-lg transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
