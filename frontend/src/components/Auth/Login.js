import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react';
import { loginUser, clearError, clearSuccess } from '../../store/slices/authSlice';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success, isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success('Login successful!');
      dispatch(clearSuccess());
      navigate('/dashboard');
    }
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [error, success, isAuthenticated, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden group transition-all duration-1000 group-hover:bg-gradient-to-br group-hover:from-purple-200 group-hover:via-pink-200 group-hover:to-red-200">


      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-10 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-blue-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-blue-700">
            Or{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-blue-300 placeholder-blue-400 text-blue-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-300"
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-blue-300 placeholder-blue-400 text-blue-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-300"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500 hover:text-blue-700 transition duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Role Selection for Login */}
            <div>
              <label htmlFor="loginRole" className="block text-sm font-medium text-blue-700 mb-2">
                Login as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex cursor-pointer rounded-lg border border-blue-300 bg-white p-4 shadow-sm focus:outline-none hover:border-blue-400 transition-colors duration-300">
                  <input
                    {...register('loginRole', { required: 'Please select login type' })}
                    type="radio"
                    value="user"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-blue-900 flex items-center">
                        <User className="h-5 w-5 text-blue-600 mr-2" />
                        Regular User
                      </span>
                    </span>
                  </span>
                  <span className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500" aria-hidden="true"></span>
                </label>

                <label className="relative flex cursor-pointer rounded-lg border border-blue-300 bg-white p-4 shadow-sm focus:outline-none hover:border-blue-400 transition-colors duration-300">
                  <input
                    {...register('loginRole', { required: 'Please select login type' })}
                    type="radio"
                    value="admin"
                    className="sr-only peer"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-blue-900 flex items-center">
                        <Shield className="h-5 w-5 text-purple-600 mr-2" />
                        Admin User
                      </span>
                    </span>
                  </span>
                  <span className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500" aria-hidden="true"></span>
                </label>
              </div>
              {errors.loginRole && (
                <p className="mt-1 text-sm text-red-600">{errors.loginRole.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
