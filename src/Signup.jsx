import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import nhost from './nhost';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [signupStatus, setSignupStatus] = useState('');
  const navigate = useNavigate();

  const validatePassword = (value) => {
    if (value.length < 5) {
      setPasswordError('Password must be at least 5 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      return;
    }

    setLoading(true);
    setSignupStatus('');
  
    try {
      const { session, error: signUpError } = await nhost.auth.signUp({
        email,
        password,
        metadata: { name },
        options: {
          allowedRoles: ['user'],
          defaultRole: 'user',
        },
      });
  
      if (signUpError) {
        if (signUpError.error === 'email-already-exists') {
          setSignupStatus('error');
          console.error('Signup error: Email already exists');
          return;
        }
        console.error('Signup error:', signUpError.message);
        setSignupStatus('error');
        return;
      }
  
      // Email verification is required
      setSignupStatus('verification-email-sent');
      
      // Don't navigate immediately since we want the user to verify their email
      if (session) {
        console.log('User signed up:', session);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setSignupStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (signupStatus) {
      case 'verification-email-sent':
        return {
          type: 'success',
          message: 'Please check your email to verify your account. A verification link has been sent to your email address.'
        };
      case 'error':
        return {
          type: 'error',
          message: 'This email is already registered. Please try logging in or use a different email address.'
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ReachNews
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>
        
        {statusMessage && (
          <div className={`rounded-md p-4 ${
            statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm">{statusMessage.message}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Password (min. 5 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  passwordError ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                required
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordError}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!passwordError}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (loading || !!passwordError) ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;