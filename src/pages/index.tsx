import React from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">Welcome to AI-Powered Nutrition</h1>
      <p className="text-lg text-gray-600 mb-8">Your personalized meal recommendations await!</p>
      <div className="space-x-4">
        <Link href="/auth/login" className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90">
          Login
        </Link>
        <Link href="/auth/register" className="bg-secondary text-white px-6 py-2 rounded hover:bg-secondary/90">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;