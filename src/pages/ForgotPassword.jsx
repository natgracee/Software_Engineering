import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-green-100 mt-32 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="absolute -top-6 left-4 flex items-center text-green-700 hover:text-green-900 transition-colors duration-200 text-sm font-medium"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Login
        </button>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>
          <p className="text-gray-600">Enter your email to receive a reset link</p>
        </div>
        {submitted ? (
          <div className="text-green-700 bg-green-50 border-l-4 border-green-500 p-4 rounded-md text-center">
            If this email exists, you'll receive a reset link shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fade-in">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 