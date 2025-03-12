import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import nhost from './nhost';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
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
        console.error('Signup error:', signUpError.message);
        return;
      }
  
      if (session) {
        console.log('User signed up and logged in:', session);
        navigate('/dashboard');
      } else {
        console.warn('Signup successful but no session found.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

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
