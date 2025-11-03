'use client';
import { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false); // New state for message type
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => { // Make handleSubmit async
    e.preventDefault();
    setMessage(''); // Clear previous messages

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming data.user contains id and username
        login({ id: data.user.id, username: data.user.username }, rememberMe); // Pass user data and rememberMe to login
        setMessage(data.message || 'Login successful!');
        setIsSuccessMessage(true);
        router.push('/'); // Redirect to home page
      } else {
        setMessage(data.message || 'Login failed: ' + data.message);
        setIsSuccessMessage(false);
      }
    } catch (error) {
      console.error('Login API error:', error);
      setMessage('An error occurred during login.');
      setIsSuccessMessage(false);
    }
  };

  return (
    <PageWrapper>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-8 text-center text-gray-800">Login</h1>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'} // Toggle type based on showPassword state
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="showPassword"
              className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label htmlFor="showPassword" className="ml-2 text-gray-800 font-semibold">Show Password</label>
          </div>
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="ml-2 text-gray-800 font-semibold">Remember Me</label>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-8 shadow-lg hover:bg-blue-700 transition-colors w-full"
          >
            Login
          </button>
          {message && <p className={`text-center mt-4 font-semibold ${isSuccessMessage ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
        </form>
      </div>
    </PageWrapper>
  );
}
