import React, { useState } from "react";
import logo from "../assets/icon.png";
import signupImage from "../assets/signupimg.jpg";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "Jonas Khanwald",
    dateOfBirth: "11 December 1997",
    email: "jonas_kahnwald@gmail.com",
    otp: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 lg:grid grid-cols-2 ">
      {/* Left side - Form */}
      <div className=" w-full h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className=" flex flex-col items-center lg:items-start justify-center">
            {/* Logo */}
            <div className="lg:absolute top-10 left-10 flex items-center lg:mb-14 ">
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={logo} alt="Logo" />
              </div>
              <span className="text-xl font-semibold text-gray-900">HD</span>
            </div>

            {/* Sign up header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
            <p className="text-gray-600 mb-8">
              Sign up to enjoy the feature of HD
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Your Name */}
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors peer placeholder-transparent"
                placeholder="Jonas Khanwald"
              />
              <label
                htmlFor="name"
                className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Your Name
              </label>
            </div>

            {/* Date of Birth */}
            <div className="relative">
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value="1997-12-11"
                onChange={handleInputChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors peer pr-12"
              />
              <label
                htmlFor="dateOfBirth"
                className="absolute left-4 -top-2.5 text-sm text-blue-600 bg-white px-1"
              >
                Date of Birth
              </label>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors peer placeholder-transparent"
                placeholder="jonas_kahnwald@gmail.com"
              />
              <label
                htmlFor="email"
                className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
              >
                Email
              </label>
            </div>

            {/* OTP */}
            <div className="relative">
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors peer placeholder-transparent pr-12"
                placeholder="OTP"
              />
              <label
                htmlFor="otp"
                className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
              >
                OTP
              </label>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Sign up button */}
            <button
              type="button"
              onClick={() => console.log("Form submitted:", formData)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Sign up
            </button>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Blue abstract background */}

      <div className="p-5 lg:flex hidden">
        <img
          className="w-full h-full object-cover rounded-md"
          src={signupImage}
          alt="SignupPageImage"
        />
      </div>
    </div>
  );
};

export default SignupPage;
