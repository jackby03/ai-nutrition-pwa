import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import { getUserData } from '../lib/auth';

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUserData();
      if (!data) {
        router.push('/auth/login');
      } else {
        setUserData(data);
      }
    };

    fetchUserData();
  }, [router]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <Dashboard userData={userData} />
    </div>
  );
};

export default DashboardPage;