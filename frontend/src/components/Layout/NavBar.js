import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Home, BarChart2, User, LogOut } from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const userInitial = user ? (user.firstName ? user.firstName[0] : user.username[0]) : 'G';

  return (
    <nav className="bg-white/10 backdrop-blur-lg shadow-xl rounded-xl mx-4 my-4 p-4 flex items-center justify-between text-white border border-white/20">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-lg shadow-lg">
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
        <span className="font-bold text-xl tracking-wider">Excel Analytics</span>
      </div>
      <ul className="flex items-center space-x-10 font-semibold">
        <Link to="/dashboard" className="flex items-center space-x-2 hover:text-indigo-300 transition-colors duration-300 cursor-pointer">
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/charts" className="flex items-center space-x-2 hover:text-indigo-300 transition-colors duration-300 cursor-pointer">
          <BarChart2 size={20} />
          <span>Charts</span>
        </Link>
      </ul>
      <div className="relative">
        <div 
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-12 h-12 flex items-center justify-center font-bold cursor-pointer shadow-lg border-2 border-white/30 hover:border-indigo-400 transition-all duration-300"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {userInitial.toUpperCase()}
        </div>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 py-2 z-10">
            <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/20">
              <User size={16} className="mr-2" />
              Profile
            </Link>
            <div className="border-t border-white/20 my-1"></div>
            <button onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-white/20 w-full">
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
