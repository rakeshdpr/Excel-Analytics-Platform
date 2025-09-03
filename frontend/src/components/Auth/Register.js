import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, UserCheck, Shield } from 'lucide-react';
import { registerUser, clearError, clearSuccess } from '../../store/slices/authSlice';

const Register = () => {
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
      toast.success('Registration successful!');
      dispatch(clearSuccess());
      navigate('/dashboard');
    }
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [error, success, isAuthenticated, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden group transition-all duration-1000 group-hover:bg-gradient-to-br group-hover:from-purple-200 group-hover:via-pink-200 group-hover:to-red-200">


      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-10 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-blue-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-blue-700">
            Or{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('firstName', {
                      required: 'First name is required',
                    })}
                    type="text"
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('lastName', {
                      required: 'Last name is required',
                    })}
                    type="text"
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores',
                    },
                  })}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
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
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none hover:border-gray-400 transition-colors">
                  <input
                    {...register('role', { required: 'Please select an account type' })}
                    type="radio"
                    value="user"
                    className="sr-only peer"
                    aria-describedby="user-description"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900 flex items-center">
                        <User className="h-5 w-5 text-blue-600 mr-2" />
                        Regular User
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Upload files, create charts, and analyze data
                      </span>
                    </span>
                  </span>
                  <span className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500" aria-hidden="true"></span>
                </label>

                <label className="relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none hover:border-gray-400 transition-colors">
                  <input
                    {...register('role', { required: 'Please select an account type' })}
                    type="radio"
                    value="admin"
                    className="sr-only peer"
                    aria-describedby="admin-description"
                  />
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900 flex items-center">
                        <Shield className="h-5 w-5 text-purple-600 mr-2" />
                        Admin User
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        Manage users and platform (requires approval)
                      </span>
                    </span>
                  </span>
                  <span className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent peer-checked:border-purple-500 peer-checked:ring-2 peer-checked:ring-purple-500" aria-hidden="true"></span>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Admin Account Note:</p>
                  <p className="mt-1">If you select "Admin User", your account will be created as a regular user first. You'll need to request admin privileges, which will be reviewed by existing administrators.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
