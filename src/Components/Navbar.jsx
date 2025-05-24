import { useEffect, useState } from "react";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Features", href: "#features" },
  { name: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // state to toggle menu on mobile

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-40 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-background/80 backdrop-blur-md shadow-xs text-black"
          : "py-5 text-black"
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo / Text di kiri */}
        <a href="#" className="text-2xl font-bold text-green-500">
          BILLBuddy
        </a>

        {/* Menu navigasi untuk mobile */}
        <div className="block lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-black focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Menu navigasi desktop */}
        <ul className="hidden lg:flex gap-8">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="text-black hover:text-primary transition-colors duration-300"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Dropdown Menu untuk mobile */}
      <div
        className={`lg:hidden ${isOpen ? "block" : "hidden"} absolute left-0 right-0 bg-white shadow-md`}
      >
        <ul className="flex flex-col gap-4 py-4 px-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="text-black hover:text-primary transition-colors duration-300"
                onClick={() => setIsOpen(false)} // Close menu after click
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
