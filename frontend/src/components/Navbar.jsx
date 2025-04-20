import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      checkAdminStatus(userData);
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

  const checkAdminStatus = async (userData) => {
    try {
      const response = await API.get("/auth/user");
      setIsAdmin(response.data.isAdmin || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminCode");
    setUser(null);
    setIsAdmin(false);
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition duration-300 ${
        scrolled ? "bg-indigo-600 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-bold tracking-wide text-white hover:text-indigo-300 transition duration-300"
          >
            CourseCred
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
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
                  My Videos
                </Link>
                <Link
                  to="/browse"
                  className="text-white hover:text-indigo-300 px-4 py-2 rounded-lg transition duration-300"
                >
                  Browse Videos
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg transition duration-300"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition duration-300 text-white"
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

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden ${
            isMenuOpen ? "block" : "hidden"
          } pt-2 pb-4 space-y-2`}
        >
          <Link
            to="/"
            className="block text-white hover:bg-indigo-500 px-4 py-2 rounded-lg transition duration-300"
          >
            Home
          </Link>
          <Link
            to="/contactus"
            className="block text-white hover:bg-indigo-500 px-4 py-2 rounded-lg transition duration-300"
          >
            Contact
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="block text-white hover:bg-indigo-500 px-4 py-2 rounded-lg transition duration-300"
              >
                Dashboard
              </Link>
              <Link
                to="/videos"
                className="block text-white hover:bg-indigo-500 px-4 py-2 rounded-lg transition duration-300"
              >
                My Videos
              </Link>
              <Link
                to="/browse"
                className="block text-white hover:bg-indigo-500 px-4 py-2 rounded-lg transition duration-300"
              >
                Browse Videos
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg transition duration-300"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition duration-300 text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-white hover:bg-indigo-500 px-4 py-2 rounded-lg transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block bg-white text-indigo-600 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition duration-300"
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
