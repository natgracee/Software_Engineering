import { useNavigate } from "react-router-dom";
import { Background } from "../Components/Background"; 
import { Navbar } from "../Components/Navbar";
import { Toggle } from "../Components/Toggle";
import { Page } from "../Components/Page";

export const Home = () => {
  const navigate = useNavigate(); 

  const handleGetStarted = () => {
    navigate("/register"); // Menggunakan path yang sesuai
  };

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <Toggle />
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          {/* <Navbar /> */}
          <Page handleGetStarted={handleGetStarted} />
        </div>
      </div>
    </div>
  );
};
