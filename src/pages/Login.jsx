import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  
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
      
      console.log("Login successful:", response);
      // Store the token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      navigate("/main", { state: { username: formData.username } });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page-container">
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-primary text-sm sm:text-base">
        <span className="font-semibold opacity-70 text-primary">BILLbuddy</span>
      </div>

      <div className="w-full max-w-md">
        <div className="text-left mb-8">
          <h2 className="text-muted-foreground text-xl">We missed you!</h2>
          <p className="text-2xl font-bold">Sign in and let's roll.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col text-left">
            <label htmlFor="username" className="text-sm font-medium">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-primary-foreground hover:underline">
              Forgot password?
            </Link>
          </div>

          <p className="mt-5 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-primary-foreground hover:underline">
              Register
            </Link>
          </p>

          <button 
            type="submit" 
            className="green-button w-full py-3 text-lg font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
};
