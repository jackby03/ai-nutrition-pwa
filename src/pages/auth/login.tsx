import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthForm from '../../components/AuthForm';
import { login } from '../../lib/auth';

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <AuthForm onSubmit={handleLogin} />
      </div>
    </div>
  );
};

export default LoginPage;