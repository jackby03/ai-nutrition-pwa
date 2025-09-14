import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { registerUser } from '../../lib/auth';
import AuthForm from '../../components/AuthForm';

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (email: string, password: string) => {
    try {
      await registerUser(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <AuthForm onSubmit={handleRegister} />
    </div>
  );
};

export default Register;