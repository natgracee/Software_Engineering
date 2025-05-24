import React from "react";
import "./Loadingsreen.css"; // nanti buat CSS-nya

export const Loadingscreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute top-1/2 transform -translate-y-1/2 z-10 text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-white animate-pulse">Loading...</h2>
      </div>
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-[20%] text-3xl animate-fall delay-[0s]">💵</div>
        <div className="absolute top-0 left-[40%] text-3xl animate-fall delay-[0.5s]">💵</div>
        <div className="absolute top-0 left-[60%] text-3xl animate-fall delay-[1s]">💵</div>
        <div className="absolute top-0 left-[80%] text-3xl animate-fall delay-[1.5s]">💵</div>
        <div className="absolute top-0 left-[30%] text-3xl animate-fall delay-[2s]">💵</div>
      </div>
    </div>
  );
};

