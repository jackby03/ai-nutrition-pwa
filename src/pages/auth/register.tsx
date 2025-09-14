import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { register } from 'lib/auth';
import AuthForm from '../../components/AuthForm';

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (email: string, password: string) => {
    try {
      await register(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <AuthForm onSubmit={handleRegister} />
      </div>
    </div>
  );
};

export default Register;