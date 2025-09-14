import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import UserProfileSetup from '../components/UserProfileSetup';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Check if user profile is complete
    const checkProfile = async () => {
      try {
        const response = await fetch('/api/user/check-profile');
        const data = await response.json();
        setProfileCompleted(data.profileCompleted);
      } catch (error) {
        console.error('Error checking profile:', error);
        setProfileCompleted(false);
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, [session, status, router]);

  if (status === 'loading' || checking) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  if (!session) {
    return null; // Will redirect
  }

  // Show profile setup if not completed
  if (profileCompleted === false) {
    return <UserProfileSetup userEmail={session.user?.email || ''} />;
  }

  return (
    <div>
      <Navbar />
      {session.user && <Dashboard userData={session.user} />}
    </div>
  );
};

export default DashboardPage;