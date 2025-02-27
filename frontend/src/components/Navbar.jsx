import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo-container">
        <Link to="/home" className="nav-link">
          <h2>CourseCred</h2>
        </Link>
      </div>
      <nav>
        <ul className="nav">
          <li>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </li>
          <li>
            <Link to="/shop" className="nav-link">
              Login
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="nav-link">
              Contact Us
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
