import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactUs = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-700 to-indigo-600 text-white">
      <div
        className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl max-w-lg w-full"
        data-aos="fade-up"
      >
        <h2 className="text-4xl font-extrabold text-indigo-700 mb-6 text-center">
          Contact Us
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          We'd love to hear from you! Fill out the form below and we'll get back
          to you as soon as possible.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Name Input */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
          {/* Email Input */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
          {/* Message Input */}
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            rows="4"
            required
          ></textarea>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
