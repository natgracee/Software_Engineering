import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import { GoogleLogin } from "@react-oauth/google";

export const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      setError("The password must be at least 8 characters long and contain at least one uppercase letter.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan Konfirmasi Password harus sama.");
      return;
    }

    setError("");
    console.log("Form submitted:", formData);

    navigate("/login");
  };

  // const handleGoogleLogin = (response) => {
  //   console.log("Google login successful:", response);
  //   // Kirim token atau data ke server untuk proses otentikasi
  // };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 lg:px-40">
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-primary text-sm sm:text-base">
        <span className="font-semibold opacity-70 text-primary">BILLbuddy</span>
      </div>

      <div className="w-full max-w-md">
        <div className="text-left mb-8">
          <h2 className="text-muted-foreground text-xl">Join our family,</h2>
          <p className="text-2xl font-bold">Create Account now!</p>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col text-left">
            <label htmlFor="username" className="text-sm font-medium">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
            <small className="text-sm text-gray-500 mt-1">The password must be at least 8 characters long and contain at least one uppercase letter.</small>
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="text-sm sm:text-base mt-4 text-left">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-primary-foreground hover:underline">
              Login
            </Link>
          </div>

          <button type="submit" className="green-button w-full py-3 text-lg font-semibold">
            Register
          </button>

        </form>
      </div>
    </section>
  );
};
