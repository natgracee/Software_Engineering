import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted:", formData);

    navigate("/main", { state: { username: formData.username } });
  };

  return (
    <section className="page-container">
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-primary text-sm sm:text-base">
        <span className="font-semibold opacity-70 text-primary">BILLbuddy</span>
      </div>

      <div className="w-full max-w-md">
        <div className="text-left mb-8">
          <h2 className="text-muted-foreground text-xl">We missed you!</h2>
          <p className="text-2xl font-bold">Sign in and let’s roll.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col text-left">
            <label htmlFor="username" className="text-sm font-medium">Username</label> {/* Menambahkan Username */}
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded-md"
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

          <button type="submit" className="green-button w-full py-3 text-lg font-semibold">
            Login
          </button>
        </form>
      </div>
    </section>
  );
};
