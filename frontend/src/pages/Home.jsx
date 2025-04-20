import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });
  }, []);

  return (
    <div className="bg-gray-50 font-sans">
      <style>
        {`
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #4f46e5, #3b82f6);
            border-radius: 10px;
          }
        `}
      </style>

      {/* Hero Section */}
      <section
        className="min-h-screen bg-gradient-to-r from-blue-700 to-indigo-600 text-white text-center flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
        data-aos="fade-up"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-4xl mx-auto">
          Transform Learning, Earn as You Teach
        </h1>
        <p className="text-lg sm:text-xl max-w-3xl mx-auto mt-4 px-4">
          Share your knowledge, earn credits based on course difficulty, and
          unlock premium content effortlessly.
        </p>
        <Link
          to="/register"
          className="mt-8 px-6 sm:px-8 py-3 bg-white text-blue-700 font-semibold rounded-full shadow-lg hover:bg-gray-200 transition-all text-base sm:text-lg"
        >
          Get Started
        </Link>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-gray-800 text-center"
          data-aos="fade-up"
        >
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
          {[
            {
              title: "Upload a Course",
              desc: "Share your expertise with the world by uploading engaging courses.",
            },
            {
              title: "Earn Credits",
              desc: "The difficulty of your course determines the reward credits you earn.",
            },
            {
              title: "Buy Courses",
              desc: "Use earned credits to access exclusive premium courses from top educators.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-indigo-700">
                {item.title}
              </h3>
              <p className="text-gray-600 text-base sm:text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        data-aos="fade-up"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-gray-800 text-center">
          Featured Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
          {[
            "Advanced Web Development",
            "AI & Machine Learning",
            "UI/UX Design Principles",
          ].map((course, index) => (
            <div
              key={index}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-3">
                {course}
              </h3>
              <p className="text-gray-600 text-base sm:text-lg">
                Master this skill with expert-led content and real-world
                projects.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white"
        data-aos="fade-up"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-gray-800 text-center">
          What Our Users Say
        </h2>
        <div
          className="max-w-4xl mx-auto p-6 sm:p-10 bg-gray-100 rounded-xl shadow-xl"
          data-aos="fade-up"
        >
          <p className="text-lg sm:text-xl italic text-gray-700">
            "This platform has completely changed the way I learn and share
            knowledge. The credit system makes learning more accessible!"
          </p>
          <p className="mt-6 font-semibold text-indigo-700 text-base sm:text-lg">
            - Alex Morgan, Educator & Learner
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-indigo-900 text-white text-center py-6 sm:py-8 px-4"
        data-aos="fade-up"
      >
        <p className="text-base sm:text-lg font-light">
          &copy; 2025 CourseCred | Empowering Knowledge Exchange
        </p>
      </footer>
    </div>
  );
};

export default Home;
