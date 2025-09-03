import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  X,
  Home,
  User,
  LogOut,
  BarChart3,
  Shield
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Charts', href: '/charts', icon: BarChart3 },
  ];

  const adminNavigation = [
    { name: 'Admin Panel', href: '/admin', icon: Shield, adminOnly: true },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-900">Excel Analytics</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.disabled ? '#' : item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
                {item.disabled && (
                  <span className="ml-auto text-xs text-gray-400">Coming Soon</span>
                )}
              </Link>
            ))}
            {user?.role === 'admin' && adminNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-semibold text-gray-900">Excel Analytics</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.disabled ? '#' : item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
                {item.disabled && (
                  <span className="ml-auto text-xs text-gray-400">Coming Soon</span>
                )}
              </Link>
            ))}
            {user?.role === 'admin' && adminNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.firstName || user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
