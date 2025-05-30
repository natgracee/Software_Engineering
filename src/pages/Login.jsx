import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useUser } from "../context/UserContext";

export const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({
        username: formData.username,
        password: formData.password
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
        updateUser(response.user);
        navigate("/main");
      }
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 lg:px-40">
        {/* Logo and Brand */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
          <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            BILLbuddy
          </span>
        </div>

        {/* Main Content Card */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-green-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Please login to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};
