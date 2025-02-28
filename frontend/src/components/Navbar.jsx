import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 left-0 z-50 backdrop-blur-lg bg-gradient-to-r from-blue-700 to-indigo-600 bg-opacity-90 text-white py-4 px-6 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-2xl font-bold">
          <Link
            to="/"
            className="text-white hover:text-gray-300 transition-all"
          >
            CourseCred
          </Link>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link
            to="/register"
            className="text-white hover:text-gray-300 transition-all"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="text-white hover:text-gray-300 transition-all"
          >
            Login
          </Link>
          <Link
            to="/contactus"
            className="text-white hover:text-gray-300 transition-all"
          >
            Contact Us
          </Link>
        </nav>
        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center bg-gradient-to-r from-blue-700 to-indigo-600 py-4 space-y-4 shadow-md">
          <Link
            to="/register"
            className="text-white hover:text-gray-300 transition-all"
            onClick={() => setIsOpen(false)}
          >
            Register
          </Link>
          <Link
            to="/login"
            className="text-white hover:text-gray-300 transition-all"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/contactus"
            className="text-white hover:text-gray-300 transition-all"
            onClick={() => setIsOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
