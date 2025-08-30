import React, { useState } from "react";
import logo from "../assets/icon.png";
import signupImage from "../assets/signupimg.jpg";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface FieldErrors {
  name?: string;
  email?: string;
  dateOfBirth?: string;
  otp?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: FieldErrors;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp, signinOtp, googleLoginUrl } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    email: "",
    otp: "",
  });
  const [step, setStep] = useState<"enter" | "verify" | "signin">("enter");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [otpFromServer, setOtpFromServer] = useState<string | null>(null);
  const [emailServiceWorking, setEmailServiceWorking] = useState<boolean>(true);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (name.trim().length > 100)
      return "Name must be less than 100 characters";
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name.trim()))
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    return undefined;
  };

  const validateDateOfBirth = (dob: string): string | undefined => {
    if (!dob) return undefined; // Optional field
    const date = new Date(dob);
    const today = new Date();
    const minAge = 13;
    const maxAge = 120;

    if (isNaN(date.getTime())) return "Please enter a valid date";
    if (date > today) return "Date of birth cannot be in the future";

    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      // Subtract one year if birthday hasn't occurred this year
    }

    if (age < minAge) return `You must be at least ${minAge} years old`;
    if (age > maxAge) return `Please enter a valid date of birth`;

    return undefined;
  };

  const validateOtp = (otp: string): string | undefined => {
    if (!otp.trim()) return "OTP is required";
    if (!/^\d{6}$/.test(otp.trim())) return "OTP must be exactly 6 digits";
    return undefined;
  };

  const validateCurrentStep = (): ValidationResult => {
    const errors: FieldErrors = {};

    if (step === "enter") {
      errors.email = validateEmail(formData.email);
      if (mode === "signup") {
        errors.name = validateName(formData.name);
        errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth);
      }
    } else if (step === "verify" || step === "signin") {
      errors.otp = validateOtp(formData.otp);
      if (step === "verify") {
        errors.name = validateName(formData.name);
      }
    }

    // Remove undefined errors
    Object.keys(errors).forEach((key) => {
      if (errors[key as keyof FieldErrors] === undefined) {
        delete errors[key as keyof FieldErrors];
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For OTP, only allow digits and limit to 6 characters
    let processedValue = value;
    if (name === "otp") {
      processedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Mark field as touched
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Clear field-specific error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general error when user makes changes
    if (error) {
      setError(null);
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    // Validate the specific field on blur
    let fieldError: string | undefined;
    switch (fieldName) {
      case "email":
        fieldError = validateEmail(formData.email);
        break;
      case "name":
        fieldError = validateName(formData.name);
        break;
      case "dateOfBirth":
        fieldError = validateDateOfBirth(formData.dateOfBirth);
        break;
      case "otp":
        fieldError = validateOtp(formData.otp);
        break;
    }

    if (fieldError) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: fieldError }));
    }
  };

  const getApiErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (error?.error) {
      // Map specific API errors to user-friendly messages
      switch (error.error) {
        case "User not found. Please sign up first.":
          return "No account found with this email. Please sign up first.";
        case "InvalidOrExpiredOtp":
          return "The OTP code is invalid or has expired. Please request a new one.";
        default:
          return error.error;
      }
    }
    return "An unexpected error occurred. Please try again.";
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate the current step
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        // For signin mode, send OTP with signin mode
        const result = await requestOtp(formData.email, "signin");
        if (result.user) {
          setExistingUser(result.user);
          setFormData((prev) => ({ ...prev, name: result.user!.name }));
        }
        setOtpFromServer(result.code || null);
        setEmailServiceWorking(result.emailServiceWorking ?? true);
        setStep("signin");
      } else {
        // For signup mode, check if email exists
        const result = await requestOtp(formData.email, "signup");
        if (result.emailExists && result.user) {
          setExistingUser(result.user);
          setFormData((prev) => ({ ...prev, name: result.user!.name }));
          setOtpFromServer(result.code || null);
          setEmailServiceWorking(result.emailServiceWorking ?? true);
          setStep("signin");
        } else {
          setOtpFromServer(result.code || null);
          setEmailServiceWorking(result.emailServiceWorking ?? true);
          setStep("verify");
        }
      }
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate the current step
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({
        email: formData.email,
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        code: formData.otp.trim(),
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate the current step
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await signinOtp({
        email: formData.email,
        code: formData.otp.trim(),
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setStep("enter");
    setMode("signup");
    setExistingUser(null);
    setFormData({ name: "", dateOfBirth: "", email: "", otp: "" });
    setError(null);
    setFieldErrors({});
    setTouchedFields({});
    setOtpFromServer(null);
    setEmailServiceWorking(true);
  };

  const toggleMode = () => {
    setMode(mode === "signup" ? "signin" : "signup");
    setStep("enter");
    setExistingUser(null);
    setFormData({ name: "", dateOfBirth: "", email: "", otp: "" });
    setError(null);
    setFieldErrors({});
    setTouchedFields({});
    setOtpFromServer(null);
    setEmailServiceWorking(true);
  };

  // Helper function to get field validation classes
  const getFieldClasses = (
    fieldName: keyof FieldErrors,
    baseClasses: string
  ) => {
    const hasError = fieldErrors[fieldName] && touchedFields[fieldName];
    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500`;
    }
    return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
  };

  // Helper function to render field error
  const renderFieldError = (fieldName: keyof FieldErrors) => {
    const error = fieldErrors[fieldName];
    const isTouched = touchedFields[fieldName];

    if (error && isTouched) {
      return (
        <div className="mt-1 text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      );
    }
    return null;
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

            {/* Dynamic header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === "signin"
                ? step === "signin"
                  ? "Welcome back"
                  : "Sign in"
                : "Sign up"}
            </h1>
            <p className="text-gray-600 mb-8">
              {step === "signin"
                ? `Hello ${
                    existingUser?.name || formData.name
                  }, enter your OTP to continue`
                : mode === "signin"
                ? "Enter your email to receive an OTP"
                : "Sign up to enjoy the feature of HD"}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                {error}
              </div>
            )}
            {/* Your Name - only show for signup mode and not during signin step */}
            {mode === "signup" && step !== "signin" && (
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("name")}
                  className={getFieldClasses(
                    "name",
                    "w-full px-4 py-4 border rounded-lg focus:ring-2 outline-none transition-colors peer placeholder-transparent"
                  )}
                  placeholder="Jonas Khanwald"
                  autoComplete="given-name"
                />
                <label
                  htmlFor="name"
                  className={`absolute left-4 -top-2.5 text-sm bg-white px-1 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm ${
                    fieldErrors.name && touchedFields.name
                      ? "text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600"
                      : "text-gray-600 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-600"
                  }`}
                >
                  Your Name *
                </label>
                {renderFieldError("name")}
              </div>
            )}

            {/* Date of Birth - only show for signup mode */}
            {mode === "signup" && (step === "enter" || step === "verify") && (
              <div className="relative">
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("dateOfBirth")}
                  className={getFieldClasses(
                    "dateOfBirth",
                    "w-full px-4 py-4 border rounded-lg focus:ring-2 outline-none transition-colors peer pr-12"
                  )}
                  autoComplete="bday"
                />
                <label
                  htmlFor="dateOfBirth"
                  className={`absolute left-4 -top-2.5 text-sm bg-white px-1 ${
                    fieldErrors.dateOfBirth && touchedFields.dateOfBirth
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  Date of Birth (Optional)
                </label>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg
                    className={`w-5 h-5 ${
                      fieldErrors.dateOfBirth && touchedFields.dateOfBirth
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
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
                {renderFieldError("dateOfBirth")}
              </div>
            )}

            {/* Email - show in all steps but disable during OTP verification */}
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("email")}
                disabled={step === "signin" || step === "verify"}
                className={`${getFieldClasses(
                  "email",
                  "w-full px-4 py-4 border rounded-lg focus:ring-2 outline-none transition-colors peer placeholder-transparent"
                )} ${
                  step === "signin" || step === "verify"
                    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                    : ""
                }`}
                placeholder="jonas_kahnwald@gmail.com"
                autoComplete="email"
              />
              <label
                htmlFor="email"
                className={`absolute left-4 -top-2.5 text-sm bg-white px-1 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm ${
                  fieldErrors.email && touchedFields.email
                    ? "text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600"
                    : "text-gray-600 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-600"
                }`}
              >
                Email *
              </label>
              {renderFieldError("email")}
            </div>

            {/* OTP - only show during verification steps */}
            {(step === "verify" || step === "signin") && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("otp")}
                    className={getFieldClasses(
                      "otp",
                      "w-full px-4 py-4 border rounded-lg focus:ring-2 outline-none transition-colors peer placeholder-transparent pr-12"
                    )}
                    placeholder="123456"
                    autoFocus
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  <label
                    htmlFor="otp"
                    className={`absolute left-4 -top-2.5 text-sm bg-white px-1 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm ${
                      fieldErrors.otp && touchedFields.otp
                        ? "text-red-600 peer-placeholder-shown:text-red-400 peer-focus:text-red-600"
                        : "text-gray-600 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-600"
                    }`}
                  >
                    OTP (6 digits) *
                  </label>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className={`w-5 h-5 ${
                        fieldErrors.otp && touchedFields.otp
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
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
                  {renderFieldError("otp")}
                </div>

                {/* OTP Display - show when OTP is available */}
                {otpFromServer && (
                  <div
                    className={`border rounded-lg p-4 ${
                      emailServiceWorking
                        ? "bg-blue-50 border-blue-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className={`h-5 w-5 mt-0.5 ${
                            emailServiceWorking
                              ? "text-blue-400"
                              : "text-yellow-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              emailServiceWorking
                                ? "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            }
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            emailServiceWorking
                              ? "text-blue-800"
                              : "text-yellow-800"
                          }`}
                        >
                          {emailServiceWorking
                            ? "🧪 Testing Mode - OTP"
                            : "📧 Email Service Not Working"}
                        </h3>
                        <div
                          className={`mt-2 text-sm ${
                            emailServiceWorking
                              ? "text-blue-700"
                              : "text-yellow-700"
                          }`}
                        >
                          <p className="mb-2">
                            {emailServiceWorking
                              ? "For testing purposes only, here's your OTP code:"
                              : "The email service is temporarily unavailable. Please use this OTP code:"}
                          </p>
                          <div
                            className={`bg-white border rounded-md p-3 text-center ${
                              emailServiceWorking
                                ? "border-blue-300"
                                : "border-yellow-300"
                            }`}
                          >
                            <span className="text-2xl font-bold text-blue-600 tracking-widest">
                              {otpFromServer}
                            </span>
                          </div>
                          <p className="mt-2 text-xs">
                            {emailServiceWorking
                              ? "The email service provider is down that's why sending otp in test mode."
                              : "Copy this code and paste it in the OTP field above."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            {step === "enter" ? (
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading && (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {loading
                  ? "Sending OTP..."
                  : mode === "signin"
                  ? "Send OTP"
                  : "Send OTP"}
              </button>
            ) : step === "verify" ? (
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading && (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSignin}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {loading && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <button
                  type="button"
                  onClick={handleBackToSignup}
                  disabled={loading}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Not your account? Sign up with different email
                </button>
              </div>
            )}

            {/* Google OAuth - only show on initial step */}
            {step === "enter" && (
              <div className="flex items-center justify-center">
                <a
                  href={googleLoginUrl}
                  className="mt-2 inline-flex items-center justify-center w-full border border-gray-300 rounded-lg py-3 text-gray-700 hover:bg-gray-50"
                >
                  Continue with Google
                </a>
              </div>
            )}

            {/* Toggle between signup and signin */}
            {step === "enter" && (
              <p className="text-center text-sm text-gray-600">
                {mode === "signup"
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  {mode === "signup" ? "Sign in" : "Sign up"}
                </button>
              </p>
            )}
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
