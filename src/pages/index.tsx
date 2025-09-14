import React from 'react';
import Link from 'next/link';
import styles from '../styles/globals.css';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Welcome to AI-Powered Nutrition</h1>
      <p>Your personalized meal recommendations await!</p>
      <div className={styles.links}>
        <Link href="/auth/login">Login</Link>
        <Link href="/auth/register">Register</Link>
      </div>
    </div>
  );
};

export default Home;