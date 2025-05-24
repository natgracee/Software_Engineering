import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

export const Page = ({ handleGetStarted }) => {
  return (
    <section
      id="home"
      className="relative flex flex-col items-center justify-center min-h-screen text-center px-4"
    >
      <div className="container z-10 flex flex-col items-center justify-center space-y-6 max-w-4xl">
        {/* Judul */}
        <h1 className="text-2xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          <span className="text-primary-foreground opacity-0 animate-fade-in"> BILL</span>
          <span className="text-primary opacity-0 animate-fade-in-delay-1"> Buddy</span>
        </h1>

        {/* Gambar */}
        <div className="relative w-full max-w-md my-8">
          <img
            src=""
            alt="Your Image"
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Subjudul */}
        <h2 className="text-2xl md:text-4xl font-bold text-black mt-0">
          One App, Many Bills, Zero Hassle
        </h2>

        {/* Paragraf */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl opacity-0 animate-fade-in-delay-3 mt-2">
          Manage multiple bills and split payments with ease—all in one app. No more transferring back and forth, just simple, fair sharing.
        </p>

        {/* Tombol */}
        <div className="pt-4 opacity-0 animate-fade-in-delay-4 mt-2">
          <button
            onClick={handleGetStarted}
            className="green-button text-lg sm:text-xl md:text-2xl px-6 py-3"
          >
            Get started
          </button>
        </div>
      </div>
    </section>

  );
};
