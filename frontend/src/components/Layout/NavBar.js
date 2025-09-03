import React from 'react';

const NavBar = () => {
  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg rounded-lg mx-6 my-4 p-4 flex items-center justify-between text-white">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6h13M9 6L4 12l5 6"
            />
          </svg>
        </div>
        <span className="font-bold text-lg">Excel Analytics</span>
      </div>
      <ul className="flex space-x-8 font-semibold">
        <li className="hover:text-indigo-400 cursor-pointer">Home</li>
        <li className="hover:text-indigo-400 cursor-pointer">Charts</li>
        <li className="hover:text-indigo-400 cursor-pointer">AI Summary</li>
        <li className="hover:text-indigo-400 cursor-pointer">About</li>
      </ul>
      <div className="flex items-center space-x-2">
        <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center font-bold cursor-pointer">
          S
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
