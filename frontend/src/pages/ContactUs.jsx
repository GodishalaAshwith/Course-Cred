import React, { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/complaints",
        formData
      );
      if (response.data.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to submit complaint. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-indigo-600 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div
        className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-lg"
        data-aos="fade-up"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 mb-4 text-center">
          Contact Us
        </h2>
        <p className="text-gray-600 mb-8 text-center text-base sm:text-lg">
          We'd love to hear from you! Fill out the form below and we'll get back
          to you as soon as possible.
        </p>

        {success && (
          <div className="mb-4 px-6 py-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800 shadow-sm transition-all duration-300">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p>Thank you for your feedback! We'll get back to you soon.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 px-6 py-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 shadow-sm transition-all duration-300">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-gray-700 font-medium block">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-700 font-medium block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="subject"
              className="text-gray-700 font-medium block"
            >
              Subject
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              placeholder="What is this regarding?"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
              minLength={5}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="message"
              className="text-gray-700 font-medium block"
            >
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="How can we help you?"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              rows="5"
              required
              minLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
