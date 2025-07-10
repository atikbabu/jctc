// /pages/login.js
import { getCsrfToken, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function LoginPage({ csrfToken }) {
  const router = useRouter();
  const { message, error } = router.query;
  const [displayMessage, setDisplayMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (message === 'logged_out') {
      setDisplayMessage('You have been logged out successfully.');
    } else if (message === 'session_expired') {
      setDisplayMessage('Your session has expired. Please log in again.');
    } else if (message === 'inactive') {
      setDisplayMessage('You have been logged out due to inactivity.');
    } else if (error) {
      const errorMessages = {
        CredentialsSignin: 'Invalid username or password.',
        // Add other error messages as needed
      };
      setDisplayMessage(errorMessages[error] || 'An error occurred. Please try again.');
    }
  }, [message, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result.error) {
      setDisplayMessage(result.error === 'CredentialsSignin' ? 'Invalid username or password.' : 'An error occurred. Please try again.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
        {displayMessage && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
            {displayMessage}
          </div>
        )}
        <input name="username" type="text" placeholder="Username" required className="border p-2 w-full rounded mb-3" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input name="password" type="password" placeholder="Password" required className="border p-2 w-full rounded mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}
